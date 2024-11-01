'use client'

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { User, Post } from '@/types';
import { useAppSelector } from '@/redux/hooks';
import { db, storage } from '@/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  DocumentReference,
  updateDoc,
  doc,
  arrayUnion
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, StorageReference } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { EventInput } from '@/components/ui-elements/EventInput';

const generateSimpleId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

interface PostInputProps {
  inputPlaceholder: string;
  communityId?: string;
  onPostCreated?: (newPost: Post) => void;
}

export default function PostInput({ inputPlaceholder, communityId, onPostCreated }: PostInputProps) {
  const router = useRouter();
  const user: User = useAppSelector((state) => state.user);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const validateFirebaseConfig = () => {
    if (!db) throw new Error('Firestore instance is not initialized');
    if (!storage) throw new Error('Firebase Storage is not initialized');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];

    if (file) {
      try {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const maxSize = 5 * 1024 * 1024;

        if (!validTypes.includes(file.type)) {
          throw new Error('Please select a valid image file (JPEG, PNG, or GIF)');
        }

        if (file.size > maxSize) {
          throw new Error('File size should be less than 5MB');
        }

        setImageFile(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error selecting image');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const imageFileName = `${generateSimpleId()}-${file.name}`;
      const imageRef: StorageReference = ref(storage, `posts/${imageFileName}`);
      const uploadResult = await uploadBytes(imageRef, file);
      return await getDownloadURL(uploadResult.ref);
    } catch (err) {
      console.error('Error uploading image:', err);
      throw new Error('Failed to upload image');
    }
  };

  const createFirestorePost = async (postData: Partial<Post>) => {
    try {
      const cleanedPostData = Object.fromEntries(
        Object.entries(postData).filter(([_, value]) => value !== undefined)
      );

      const postsRef = collection(db, 'posts');
      const docRef: DocumentReference = await addDoc(postsRef, {
        ...cleanedPostData,
        postCreatedAt: serverTimestamp()
      });

      return docRef.id;
    } catch (err) {
      console.error('Error creating Firestore document:', err);
      throw new Error('Failed to save post to database');
    }
  };

  const updateUserPosts = async (userId: string, postId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        userPosts: arrayUnion(postId)
      });
    } catch (err) {
      console.error('Error updating user posts:', err);
      throw new Error('Failed to update user posts');
    }
  };

  const updateCommunityPosts = async (communityId: string, postId: string) => {
    try {
      const communityRef = doc(db, 'communities', communityId);
      await updateDoc(communityRef, {
        communityPosts: arrayUnion(postId)
      });
    } catch (err) {
      console.error('Error updating community posts:', err);
      throw new Error('Failed to update community posts');
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!content.trim() && !imageFile) {
      setError('Please add some content or an image to post');
      return;
    }

    setIsSubmitting(true);

    try {
      validateFirebaseConfig();

      if (!user?.userUID) {
        throw new Error('User data is not available');
      }

      let imageUrl = '';

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const newPost: Partial<Post> = {
        postContent: content.trim(),
        postAuthorId: user.userUID,
        postAuthorName: `${user.userFirstName} ${user.userLastName}`,
        postLikes: [],
        postComments: [],
        postCreatedAt: new Date(), // Add current date for immediate display
      };

      if (imageUrl) {
        newPost.postImageSrc = imageUrl;
      }

      if (communityId) {
        newPost.postCommunityId = communityId;
      }

      const postId = await createFirestorePost(newPost);

      await updateUserPosts(user.userUID, postId);

      if (communityId) {
        await updateCommunityPosts(communityId, postId);
      }

      const completePost: Post = {
        ...newPost as Post,
        postUID: postId,
      };

      if (onPostCreated) {
        onPostCreated(completePost);
      }
      setContent('');
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      console.log('Post created successfully');

      router.refresh();
    } catch (err) {
      console.error('Detailed error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className='bg-dark-800 p-2 sm:p-3 rounded-lg w-full'>
      <div className='bg-dark-700 px-2 sm:px-4 py-2 sm:py-3 rounded'>
        {error && (
          <div className='bg-red-500/10 border border-red-500/50 text-red-500 p-2 sm:p-3 rounded mb-3 text-sm'>
            {error}
          </div>
        )}

        <div className="border-b border-dark-500 pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center p-2">
            <div className='flex w-full'>
              <div className="flex-shrink-0">
                <Image
                  src={user?.userProfilePictureSrc || "/assets/placeholder-images/profile-picture.jpg"}
                  alt=""
                  width={40}
                  height={40}
                  className='object-cover rounded-full aspect-square sm:w-12 sm:h-12'
                />
              </div>
              <textarea
                value={content}
                onChange={(e) => {
                  setError(null);
                  setContent(e.target.value);
                }}
                className='ml-3 outline-none bg-transparent w-full resize-none text-sm sm:text-base'
                placeholder={inputPlaceholder}
                rows={1}
                style={{ minHeight: '40px', maxHeight: '200px' }}
              />
            </div>
            <div className='flex mt-2 sm:mt-0 justify-end sm:justify-start'>
              <button className='mx-1 hover:opacity-80 transition-opacity'>
                <Image
                  src="/assets/svgs/input-gif.svg"
                  alt="Add GIF"
                  width={24}
                  height={24}
                  className='sm:w-7 sm:h-7'
                />
              </button>
              <button className='mx-1 hover:opacity-80 transition-opacity'>
                <Image
                  src="/assets/svgs/input-emoji.svg"
                  alt="Add emoji"
                  width={24}
                  height={24}
                  className='sm:w-7 sm:h-7'
                />
              </button>
            </div>
          </div>

          {imageFile && (
            <div className='mt-2 px-2'>
              <p className='text-sm text-green-500'>
                ✓ Image selected: {imageFile.name}
              </p>
            </div>
          )}
        </div>

        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 mt-1 space-y-3 sm:space-y-0'>
          <div className='flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto'>
            <div className='flex items-center'>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                ref={fileInputRef}
                className='hidden'
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className='flex items-center cursor-pointer hover:opacity-80 transition-opacity'
              >
                <Image
                  src="/assets/svgs/input-camera.svg"
                  alt=""
                  width={18}
                  height={18}
                  className='mr-2'
                />
                <p className='text-sm whitespace-nowrap'>
                  {imageFile ? 'Change image' : 'Image/Video'}
                </p>
              </label>
            </div>

            {!communityId && (
              <div
                className='flex items-center cursor-pointer hover:opacity-80 transition-opacity'
                onClick={() => setIsEventModalOpen(true)}
              >
                <Image
                  src="/assets/svgs/input-events.svg"
                  alt=""
                  width={18}
                  height={18}
                  className='mr-2'
                />
                <p className='text-sm'>Events</p>
              </div>
            )}
          </div>

          <button
            className={`w-full sm:w-auto py-2 px-6 rounded-lg transition-colors ${isSubmitting
              ? 'bg-brand-300 cursor-not-allowed'
              : 'bg-brand-500 hover:bg-brand-600'
              }`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>

      <EventInput
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        userId={user?.userUID || ''}
      />
    </div>
  );
}