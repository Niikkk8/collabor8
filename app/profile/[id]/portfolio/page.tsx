'use client';

import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { Portfolio, PortfolioItem } from "@/types";
import PortfolioSection from "@/components/profile/PortfolioSection";

interface PortfolioPageProps {
    params: {
        id: string;
    };
}

interface PortfolioState {
    portfolio: Portfolio;
    loading: boolean;
    error: string | null;
    editState: {
        isEditingAbout: boolean;
        aboutMeText: string;
    };
}

const PortfolioPage: React.FC<PortfolioPageProps> = ({ params }) => {
    const currentUser = useAppSelector((state) => state.user);
    const isOwnProfile = params.id === currentUser?.userUID;

    const [state, setState] = useState<PortfolioState>({
        portfolio: {
            skills: [],
            experience: [],
            certifications: [],
            education: [],
            aboutMe: ""
        },
        loading: true,
        error: null,
        editState: {
            isEditingAbout: false,
            aboutMeText: ""
        }
    });

    useEffect(() => {
        fetchPortfolioData();
    }, [params.id]);

    const fetchPortfolioData = async () => {
        try {
            const response = await fetch(`/api/profile/${params.id}/portfolio`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch portfolio');
            }

            setState(prev => ({
                ...prev,
                portfolio: data.portfolio,
                editState: {
                    ...prev.editState,
                    aboutMeText: data.portfolio.aboutMe || ""
                },
                loading: false
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'An error occurred',
                loading: false
            }));
        }
    };

    const updatePortfolio = async (updates: Partial<Portfolio>) => {
        try {
            const response = await fetch(`/api/profile/${params.id}/portfolio`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update portfolio');
            }

            return true;
        } catch (error) {
            console.error('Error updating portfolio:', error);
            throw error;
        }
    };

    // About Me handlers
    const handleSetIsEditingAbout = (isEditing: boolean) => {
        setState(prev => ({
            ...prev,
            editState: {
                ...prev.editState,
                isEditingAbout: isEditing
            }
        }));
    };

    const handleSetAboutMeText = (text: string) => {
        setState(prev => ({
            ...prev,
            editState: {
                ...prev.editState,
                aboutMeText: text
            }
        }));
    };

    const handleEdit = async (section: keyof Portfolio, id: string, updatedItem: PortfolioItem) => {
        try {
            const newPortfolio = { ...state.portfolio };
            const sectionArray = newPortfolio[section] as PortfolioItem[];
            const itemIndex = sectionArray.findIndex(item => item.id === id);

            if (itemIndex !== -1) {
                sectionArray[itemIndex] = updatedItem;
                await updatePortfolio(newPortfolio);
                setState(prev => ({ ...prev, portfolio: newPortfolio }));
            }
        } catch (error) {
            console.error("Error saving edit:", error);
        }
    };

    const handleAdd = async (section: keyof Omit<Portfolio, 'aboutMe'>) => {
        try {
            const newItem: PortfolioItem = {
                id: Date.now().toString(),
                title: "New Item",
                description: "Description here",
                date: ""
            };

            const newPortfolio = {
                ...state.portfolio,
                [section]: [...state.portfolio[section], newItem]
            };

            await updatePortfolio(newPortfolio);
            setState(prev => ({ ...prev, portfolio: newPortfolio }));
        } catch (error) {
            console.error(`Error adding ${section} item:`, error);
        }
    };

    const handleDelete = async (section: keyof Omit<Portfolio, 'aboutMe'>, id: string) => {
        try {
            const newPortfolio = {
                ...state.portfolio,
                [section]: state.portfolio[section].filter(item => item.id !== id)
            };

            await updatePortfolio(newPortfolio);
            setState(prev => ({ ...prev, portfolio: newPortfolio }));
        } catch (error) {
            console.error(`Error deleting ${section} item:`, error);
        }
    };

    const handleEditAboutMe = async () => {
        try {
            const newPortfolio = {
                ...state.portfolio,
                aboutMe: state.editState.aboutMeText
            };

            await updatePortfolio(newPortfolio);
            setState(prev => ({
                ...prev,
                portfolio: newPortfolio,
                editState: {
                    ...prev.editState,
                    isEditingAbout: false
                }
            }));
        } catch (error) {
            console.error("Error updating about me:", error);
        }
    };

    const portfolioSections: (keyof Omit<Portfolio, 'aboutMe'>)[] = [
        'experience',
        'skills',
        'certifications',
        'education'
    ];
    if (state.loading) {
        return <div className="flex justify-center items-center min-h-screen">
            Loading...
        </div>;
    }

    if (state.error) {
        return <div className="flex justify-center items-center min-h-screen text-red-500">
            {state.error}
        </div>;
    }

    return (
        <div className="p-4 mx-auto">
            <div className="mb-8 p-6 rounded-lg border border-dark-700 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold">About Me</h2>
                    {isOwnProfile && !state.editState.isEditingAbout && (
                        <button
                            onClick={() => handleSetIsEditingAbout(true)}
                            className="px-4 py-1 text-sm border border-dark-500 rounded-md hover:bg-gray-800"
                        >
                            Edit
                        </button>
                    )}
                </div>
                {state.editState.isEditingAbout ? (
                    <div className="space-y-4">
                        <textarea
                            value={state.editState.aboutMeText}
                            onChange={(e) => handleSetAboutMeText(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md bg-transparent outline-none"
                            rows={4}
                            placeholder="Tell us about yourself..."
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => handleSetIsEditingAbout(false)}
                                className="px-4 py-2 text-sm border rounded-md hover:bg-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditAboutMe}
                                disabled={!state.editState.aboutMeText}
                                className="px-4 py-2 text-sm bg-brand-500 text-white rounded-md hover:bg-brand-500"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-600">
                        {state.portfolio.aboutMe || "No description provided."}
                    </p>
                )}
            </div>

            {portfolioSections.map((section) => (
                <PortfolioSection
                    key={section}
                    title={section.charAt(0).toUpperCase() + section.slice(1)}
                    items={state.portfolio[section]}
                    isEditable={isOwnProfile}
                    onEdit={(id, item) => handleEdit(section, id, item)}
                    onAdd={() => handleAdd(section)}
                    onDelete={(id) => handleDelete(section, id)}
                />
            ))}
        </div>
    );
};

export default PortfolioPage;