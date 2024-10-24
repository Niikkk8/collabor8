'use client'

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { User, Post, Community } from '@/types';
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

const generateSimpleId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

interface PostInputProps {
  inputPlaceholder: string;
  communityId?: string;
}

export default function PostInput({ inputPlaceholder, communityId }: PostInputProps) {
  const router = useRouter();
  const user: User = useAppSelector((state) => state.user);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        postComments: []
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

      setContent('');
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      router.refresh();

      console.log('Post created successfully');

    } catch (err) {
      console.error('Detailed error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='bg-dark-800 p-3 rounded-lg'>
      <div className='bg-dark-700 px-4 py-3 rounded'>
        {error && (
          <div className='bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded mb-4 text-sm'>
            {error}
          </div>
        )}
        <div className="border-b border-dark-500 pb-6">
          <div className="flex items-center p-2">
            <div className='flex w-full'>
              <Image src={user?.userProfilePictureSrc || "/assets/placeholder-images/profile-picture.jpg"} alt="" width={48} height={48} className='object-cover rounded-full aspect-square' />
              <textarea
                value={content}
                onChange={(e) => {
                  setError(null);
                  setContent(e.target.value);
                }}
                className='ml-3 outline-none bg-transparent w-full resize-none'
                placeholder={inputPlaceholder}
                rows={1}
                style={{ minHeight: '48px' }}
              />
            </div>
            <div className='flex'>
              <button className='mx-1'>
                <Image src="/assets/svgs/input-gif.svg" alt="Add GIF" width={28} height={28} />
              </button>
              <button className='mx-1'>
                <Image src="/assets/svgs/input-emoji.svg" alt="Add emoji" width={28} height={28} />
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

          <div className='flex items-center mt-4 px-2'>
            <Image src="/assets/svgs/input-globe.svg" alt="" width={20} height={20} />
            <p className='text-sm mx-1'>Everyone can reply</p>
          </div>
        </div>
        <div className='flex items-center justify-between p-2 mt-1'>
          <div className='flex items-center'>
            <div className='flex items-center mr-4'>
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
                className='flex items-center cursor-pointer'
              >
                <Image src="/assets/svgs/input-camera.svg" alt="" width={20} height={20} className='mr-2' />
                <p className='text-sm'>
                  {imageFile ? 'Change image' : 'Image/Video'}
                </p>
              </label>
            </div>
            <div className='flex items-center'>
              <Image src="/assets/svgs/input-events.svg" alt="" width={20} height={20} className='mr-2' />
              <p className='text-sm'>Events</p>
            </div>
          </div>
          <button
            className={`py-2 px-6 rounded-lg ${isSubmitting
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
    </div>
  );
}