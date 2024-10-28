'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Event } from '@/types';
import { db, storage } from '@/firebase';
import {
    collection,
    addDoc,
    serverTimestamp,
    updateDoc,
    doc,
    arrayUnion,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';

const generateEventId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export function EventInput({ isOpen, onClose, userId }: EventModalProps) {
    const [eventData, setEventData] = useState({
        eventTitle: '',
        eventDescription: '',
        eventDate: '',
        eventLocation: '',
        eventImageSrc: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Close modal on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Handle escape key
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen, onClose]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEventData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const file = e.target.files?.[0];

        if (file) {
            try {
                const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
                const maxSize = 5 * 1024 * 1024; // 5MB

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

    const uploadEventImage = async (file: File): Promise<string> => {
        const imageFileName = `${generateEventId()}-${file.name}`;
        const imageRef = ref(storage, `events/${imageFileName}`);
        const uploadResult = await uploadBytes(imageRef, file);
        return await getDownloadURL(uploadResult.ref);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (!eventData.eventTitle || !eventData.eventDate || !eventData.eventLocation) {
                throw new Error('Please fill in all required fields');
            }

            let imageUrl = '';
            if (imageFile) {
                imageUrl = await uploadEventImage(imageFile);
            }

            const newEvent: Partial<Event> = {
                eventTitle: eventData.eventTitle,
                eventDescription: eventData.eventDescription,
                eventDate: new Date(eventData.eventDate),
                eventLocation: eventData.eventLocation,
                eventOrganizerId: userId,
                eventMembers: [userId],
                eventImageSrc: imageUrl || '/assets/placeholder-images/event-banner.jpeg',
            };

            const eventsRef = collection(db, 'events');
            const eventDocRef = await addDoc(eventsRef, {
                ...newEvent,
                createdAt: serverTimestamp(),
            });

            const eventId = eventDocRef.id;

            await updateDoc(doc(db, 'users', String(userId)), {
                userMeetups: arrayUnion(eventId),
            });

            setEventData({
                eventTitle: '',
                eventDescription: '',
                eventDate: '',
                eventLocation: '',
                eventImageSrc: '',
            });
            setImageFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            onClose();
        } catch (err) {
            console.error('Error creating event:', err);
            setError(err instanceof Error ? err.message : 'Failed to create event');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div
                ref={modalRef}
                className="bg-dark-800 rounded-lg w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto"
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Create New Event</h2>
                        <button
                            onClick={onClose}
                            className="rounded-full py-2 px-4 bg-red-500 transition-colors"
                        >
                            X
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="eventTitle" className="block text-sm font-medium">
                                Event Title *
                            </label>
                            <input
                                id="eventTitle"
                                name="eventTitle"
                                type="text"
                                value={eventData.eventTitle}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-dark-700 rounded-lg border border-dark-500 focus:border-brand-500 focus:outline-none transition-colors"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="eventDescription" className="block text-sm font-medium">
                                Description
                            </label>
                            <textarea
                                id="eventDescription"
                                name="eventDescription"
                                value={eventData.eventDescription}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 bg-dark-700 rounded-lg border border-dark-500 focus:border-brand-500 focus:outline-none transition-colors resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="eventDate" className="block text-sm font-medium">
                                Date and Time *
                            </label>
                            <input
                                id="eventDate"
                                name="eventDate"
                                type="datetime-local"
                                value={eventData.eventDate}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-dark-700 rounded-lg border border-dark-500 focus:border-brand-500 focus:outline-none transition-colors"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="eventLocation" className="block text-sm font-medium">
                                Location *
                            </label>
                            <input
                                id="eventLocation"
                                name="eventLocation"
                                type="text"
                                value={eventData.eventLocation}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-dark-700 rounded-lg border border-dark-500 focus:border-brand-500 focus:outline-none transition-colors"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <span className="block text-sm font-medium mb-2">Event Image</span>
                            <input
                                type="file"
                                id="eventImage"
                                accept="image/*"
                                onChange={handleImageSelect}
                                ref={fileInputRef}
                                className="hidden"
                            />
                            <label
                                htmlFor="eventImage"
                                className="inline-flex items-center cursor-pointer"
                            >
                                <div className="flex items-center bg-dark-700 px-4 py-2 rounded-lg hover:bg-dark-600 border border-dark-500">
                                    <Image
                                        src="/assets/svgs/input-camera.svg"
                                        alt=""
                                        width={20}
                                        height={20}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">
                                        {imageFile ? 'Change image' : 'Upload image (16:9) preferred)'}
                                    </span>
                                </div>
                            </label>
                            {imageFile && (
                                <p className="text-sm text-green-500 mt-2">
                                    ✓ Image selected: {imageFile.name}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 border border-dark-500 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-4 py-2 rounded-lg transition-colors ${isSubmitting
                                    ? 'bg-brand-300 cursor-not-allowed'
                                    : 'bg-brand-500 hover:bg-brand-600'
                                    }`}
                            >
                                {isSubmitting ? 'Creating...' : 'Create Event'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}