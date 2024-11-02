import React, { useState, useRef, useEffect } from 'react';
import { User } from '@/types';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase';
import Image from 'next/image';
import { useAppDispatch } from '@/redux/hooks';
import { setUser } from '@/redux/userSlice';
import { useRouter } from 'next/navigation';

interface EditProfileModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditProfileModal({ user, isOpen, onClose }: EditProfileModalProps) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const modalRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user.userFirstName,
        lastName: user.userLastName,
        bio: user.userBio || '',
    });
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [profileBanner, setProfileBanner] = useState<File | null>(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState(user.userProfilePictureSrc);
    const [profileBannerPreview, setProfileBannerPreview] = useState(user.userProfileBannerSrc);

    const profilePicInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'banner') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (type === 'profile') {
            setProfilePicture(file);
            setProfilePicturePreview(URL.createObjectURL(file));
        } else {
            setProfileBanner(file);
            setProfileBannerPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let profilePictureUrl = user.userProfilePictureSrc;
            let bannerUrl = user.userProfileBannerSrc;

            if (profilePicture) {
                const profileRef = ref(storage, `users/${user.userUID}/profile-${Date.now()}`);
                await uploadBytes(profileRef, profilePicture);
                profilePictureUrl = await getDownloadURL(profileRef);
            }

            if (profileBanner) {
                const bannerRef = ref(storage, `users/${user.userUID}/banner-${Date.now()}`);
                await uploadBytes(bannerRef, profileBanner);
                bannerUrl = await getDownloadURL(bannerRef);
            }

            const updatedUser = {
                ...user,
                userFirstName: formData.firstName,
                userLastName: formData.lastName,
                userBio: formData.bio,
                userProfilePictureSrc: profilePictureUrl,
                userProfileBannerSrc: bannerUrl,
            };

            await updateDoc(doc(db, 'users', user.userUID), {
                userFirstName: formData.firstName,
                userLastName: formData.lastName,
                userBio: formData.bio,
                userProfilePictureSrc: profilePictureUrl,
                userProfileBannerSrc: bannerUrl,
            });

            dispatch(setUser(updatedUser));
            router.refresh();
            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="md:fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
                ref={modalRef}
                className="bg-dark-800 rounded-xl w-full max-w-2xl h-92 overflow-y-scroll no-scrollbar"
            >
                <div className="flex items-center justify-between p-4 border-b border-dark-700">
                    <h2 className="text-lg font-medium">Edit Profile</h2>
                    <button
                        onClick={onClose}
                        className="hover:bg-red-500 p-2 px-4 rounded-full transition-colors text-white-500"
                    >
                       X
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                    <div className="relative">
                        <div
                            className="w-full h-[150px] rounded-lg overflow-hidden bg-dark-700 cursor-pointer group"
                            onClick={() => bannerInputRef.current?.click()}
                        >
                            <Image
                                src={profileBannerPreview}
                                alt="Banner"
                                width={600}
                                height={150}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-sm">Change Banner</span>
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={bannerInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, 'banner')}
                        />
                    </div>

                    <div className="relative w-24 h-24 mx-auto mt-[-48px]">
                        <div
                            className="w-full h-full rounded-full overflow-hidden border-4 border-dark-800 cursor-pointer group"
                            onClick={() => profilePicInputRef.current?.click()}
                        >
                            <Image
                                src={profilePicturePreview}
                                alt="Profile"
                                width={96}
                                height={96}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs">Change</span>
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={profilePicInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, 'profile')}
                        />
                    </div>

                    <div className="space-y-4 mt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-white-800 block mb-1">First Name</label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                    className="w-full bg-dark-700 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-white-800 block mb-1">Last Name</label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                    className="w-full bg-dark-700 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-white-800 block mb-1">Bio</label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                className="w-full bg-dark-700 rounded-lg p-2.5 h-24 resize-none focus:outline-none focus:ring-1 focus:ring-brand-500"
                                placeholder="Write something about yourself..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm hover:bg-dark-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-brand-500 px-4 py-2 rounded-lg text-sm disabled:opacity-50 transition-opacity"
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}