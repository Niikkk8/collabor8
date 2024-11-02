import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Comment, CommentReference, User } from '@/types';
import Moment from 'react-moment';
import { useAppSelector } from '@/redux/hooks';
import { arrayUnion, doc, updateDoc, collection, setDoc, getDoc, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase';
import Link from 'next/link';

interface CommentInputProps {
  postId: string;
  parentComment?: Comment;
  onCommentPost?: () => void;
}

function CommentInput({ postId, parentComment, onCommentPost }: CommentInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser: User = useAppSelector(state => state.user);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) return;
    setIsLoading(true);

    try {
      let imageUrl = '';
      let parentCommentId = null

      if (imageFile) {
        const imageRef = ref(storage, `comments/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      const commentId = doc(collection(db, 'comments')).id;
      const now = new Date();

      if (parentComment) {
        parentCommentId = parentComment.commentUID
      }

      const newComment: Comment = {
        commentUID: commentId,
        commentContent: content.trim(),
        commentImageSrc: imageUrl || '',
        commentCreatedAt: now,
        commentAuthorId: currentUser.userUID,
        commentAuthorName: `${currentUser.userFirstName} ${currentUser.userLastName}`,
        commentLikes: [],
        commentThreads: [], // Initialize empty array
        threadRefs: [], // Initialize empty array
        postId,
        parentCommentId: parentCommentId!
      };

      const commentRef: CommentReference = {
        id: commentId,
        createdAt: now,
        parentId: parentCommentId!
      };

      await setDoc(doc(db, 'comments', commentId), newComment);

      if (parentComment) {
        await updateDoc(doc(db, 'comments', parentComment.commentUID), {
          threadRefs: arrayUnion(commentRef)
        });
      } else {
        await updateDoc(doc(db, 'posts', postId), {
          postComments: arrayUnion(commentRef)
        });
      }

      setContent('');
      removeImage();
      setIsFocused(false);
      if (onCommentPost) onCommentPost();
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-2 md:mt-4 bg-dark-800 p-2 md:p-4 rounded-lg">
      <div className="flex items-start gap-2 md:gap-3">
        <div className="hidden sm:block">
          <Image
            src={currentUser.userProfilePictureSrc}
            width={40}
            height={40}
            alt={currentUser.userFirstName}
            className="rounded-full w-8 h-8 md:w-10 md:h-10"
          />
        </div>
        <div className="flex-1 min-w-0"> {/* Added min-w-0 to prevent flex item from overflowing */}
          <textarea
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-dark-700 rounded-lg p-2 md:p-3 min-h-[40px] md:min-h-[60px] text-sm resize-none"
            onFocus={() => setIsFocused(true)}
          />

          {imagePreview && (
            <div className="relative mt-2 w-fit">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full md:max-w-[300px] rounded-lg"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-dark-900/80 p-1.5 rounded-full"
              >
                <Image src="/api/placeholder/16/16" width={16} height={16} alt="Remove" />
              </button>
            </div>
          )}

          {isFocused && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 md:mt-3 gap-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-lg hover:bg-dark-700 text-sm"
              >
                <Image src={'/assets/svgs/input-camera.svg'} width={20} height={20} alt="Add image" />
                <span className="text-sm">Add Image</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  className="px-3 md:px-4 py-1.5 text-sm hover:text-white-600"
                  onClick={() => {
                    setIsFocused(false);
                    setContent('');
                    removeImage();
                  }}
                >
                  Cancel
                </button>
                <button
                  className="bg-brand-500 px-3 md:px-4 py-1.5 rounded-lg text-sm disabled:opacity-50"
                  onClick={handleSubmit}
                  disabled={isLoading || (!content.trim() && !imageFile)}
                >
                  {isLoading ? 'Posting...' : 'Comment'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentDisplay({ comment, onUpdate }: { comment: Comment; onUpdate?: () => void }) {
  const [isReplying, setIsReplying] = useState(false);
  const [showThreads, setShowThreads] = useState(true);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [author, setAuthor] = useState<User>();
  const currentUser: User = useAppSelector(state => state.user);
  const hasLiked = comment.commentLikes.includes(currentUser.userUID);

  useEffect(() => {
    if (!comment.threadRefs?.length) return;

    const unsubscribe = onSnapshot(
      query(
        collection(db, 'comments'),
        where('parentCommentId', '==', comment.commentUID),
        orderBy('commentCreatedAt', 'desc')
      ),
      (snapshot) => {
        const replyDocs = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            commentCreatedAt: data.commentCreatedAt.toDate(),
          };
        });
        setReplies(replyDocs as Comment[]);
      }
    );


    return () => unsubscribe();
  }, [comment.commentUID, comment.threadRefs]);

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const authorRef = doc(db, 'users', comment.commentAuthorId);
        const authorSnap = await getDoc(authorRef);
        if (authorSnap.exists()) {
          setAuthor(authorSnap.data() as User);
        } else {
          console.log("No such author document!");
        }
      } catch (error) {
        console.error("Error fetching author details:", error);
      }
    };

    if (comment.commentAuthorId) {
      fetchAuthor();
    }
  }, [comment.commentAuthorId]);

  const handleLike = async () => {
    try {
      const commentRef = doc(db, 'comments', comment.commentUID);
      await updateDoc(commentRef, {
        commentLikes: hasLiked
          ? comment.commentLikes.filter(id => id !== currentUser.userUID)
          : [...comment.commentLikes, currentUser.userUID]
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  return (
    <div className="mt-2 md:mt-4 pl-2 md:pl-4">
      <div className="flex items-start gap-2 md:gap-3">
        <div className="block">
          {author ? (
            <Link href={`/profile/${comment.commentAuthorId}`}>
              <Image
                src={author.userProfilePictureSrc}
                width={40}
                height={40}
                alt={comment.commentAuthorName}
                className="rounded-full w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10"
              />
            </Link>
          ) : (
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-300 rounded-full"></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href={`/profile/${comment.commentAuthorId}`} className='flex items-center gap-1'>
              <span className="font-medium text-sm md:text-base">{comment.commentAuthorName}</span>
              <p className="text-xs sm:text-sm font-light text-white-800 hover:text-white transition-colors duration-200 truncate">
                @{author?.userID}
              </p>
            </Link>
            <span className="hidden sm:block h-[2px] w-[2px] bg-white-800" />
            <Moment fromNow className="text-xs md:text-sm text-gray-500">
              {comment.commentCreatedAt}
            </Moment>
          </div>

          <p className="mt-1 text-sm break-words">{comment.commentContent}</p>

          {comment.commentImageSrc && (
            <div className="mt-2">
              <img
                src={comment.commentImageSrc}
                alt="Comment attachment"
                className="max-w-full md:max-w-[300px] rounded-lg"
              />
            </div>
          )}

          <div className="flex items-center gap-3 md:gap-4 mt-2">
            <button
              onClick={handleLike}
              className="flex items-center gap-1 hover:text-brand-500"
            >
              <Image
                src={hasLiked ? "/assets/svgs/post-liked.svg" : "/assets/svgs/post-like.svg"}
                width={16}
                height={16}
                alt="Like"
              />
              <span className="text-xs md:text-sm">{comment.commentLikes.length}</span>
            </button>

            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1 hover:text-brand-500"
            >
              <Image
                src="/assets/svgs/post-comment.svg"
                width={16}
                height={16}
                alt="Reply"
              />
              <span className="text-xs md:text-sm">Reply</span>
            </button>
          </div>

          {isReplying && (
            <CommentInput
              postId={comment.postId}
              parentComment={comment}
              onCommentPost={() => {
                setIsReplying(false);
                if (onUpdate) onUpdate();
              }}
            />
          )}

          {replies.length > 0 && (
            <div className="mt-2 md:mt-4">
              <button
                onClick={() => setShowThreads(!showThreads)}
                className="text-xs md:text-sm text-gray-500 hover:text-white"
              >
                {showThreads ? 'Hide' : 'Show'} {replies.length} replies
              </button>

              {showThreads && (
                <div className="ml-2 border-l border-gray-700">
                  {replies.map((reply) => (
                    <CommentDisplay
                      key={reply.commentUID}
                      comment={reply}
                      onUpdate={onUpdate}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { CommentInput, CommentDisplay };