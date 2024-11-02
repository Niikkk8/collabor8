'use client'

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useAppSelector } from "@/redux/hooks";
import { Portfolio, PortfolioItem, User } from "@/types";
import PortfolioSection from "@/components/profile/PortfolioSection";

interface PortfolioPageProps {
    params: {
        id: string;
    };
}

const PortfolioPage: React.FC<PortfolioPageProps> = ({ params }) => {
    const currentUser = useAppSelector((state) => state.user);
    const isOwnProfile = params.id === currentUser?.userUID;

    const [loading, setLoading] = useState(true);
    const [portfolio, setPortfolio] = useState<Portfolio>({
        skills: [],
        experience: [],
        certifications: [],
        education: [],
        aboutMe: ""
    });

    const [isEditingAbout, setIsEditingAbout] = useState(false);
    const [aboutMeText, setAboutMeText] = useState("");

    useEffect(() => {
        fetchPortfolioData();
    }, [params.id]);

    const fetchPortfolioData = async () => {
        try {
            const userDoc = await getDoc(doc(db, "users", params.id));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.portfolio) {
                    setPortfolio(userData.portfolio);
                    setAboutMeText(userData.portfolio.aboutMe || "");
                }
            }
        } catch (error) {
            console.error("Error fetching portfolio data:", error);
        } finally {
            setLoading(false);
        }
    };

    const updatePortfolioInFirebase = async (newPortfolio: Portfolio) => {
        try {
            await updateDoc(doc(db, "users", params.id), {
                portfolio: newPortfolio
            });
        } catch (error) {
            console.error("Error updating portfolio:", error);
            throw error;
        }
    };

    const handleEdit = async (section: keyof Portfolio, id: string, updatedItem: PortfolioItem) => {
        try {
            const newPortfolio = { ...portfolio };
            const sectionArray = newPortfolio[section] as PortfolioItem[];
            const itemIndex = sectionArray.findIndex(item => item.id === id);

            if (itemIndex !== -1) {
                sectionArray[itemIndex] = updatedItem;
                await updatePortfolioInFirebase(newPortfolio);
                setPortfolio(newPortfolio);
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
                ...portfolio,
                [section]: [...portfolio[section], newItem]
            };

            await updatePortfolioInFirebase(newPortfolio);
            setPortfolio(newPortfolio);
        } catch (error) {
            console.error(`Error adding ${section} item:`, error);
        }
    };

    const handleDelete = async (section: keyof Omit<Portfolio, 'aboutMe'>, id: string) => {
        try {
            const newPortfolio = {
                ...portfolio,
                [section]: portfolio[section].filter(item => item.id !== id)
            };

            await updatePortfolioInFirebase(newPortfolio);
            setPortfolio(newPortfolio);
        } catch (error) {
            console.error(`Error deleting ${section} item:`, error);
        }
    };

    const handleEditAboutMe = async () => {
        try {
            const newPortfolio = {
                ...portfolio,
                aboutMe: aboutMeText
            };

            await updatePortfolioInFirebase(newPortfolio);
            setPortfolio(newPortfolio);
            setIsEditingAbout(false);
        } catch (error) {
            console.error("Error updating about me:", error);
        }
    };

    const portfolioSections: (keyof Omit<Portfolio, 'aboutMe'>)[] = ['experience', 'skills', 'certifications', 'education'];

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">
            Loading...
        </div>;
    }

    return (
        <div className="p-4 mx-auto">

            <div className="mb-8 p-6 rounded-lg border border-dark-700 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold">About Me</h2>
                    {isOwnProfile && !isEditingAbout && (
                        <button
                            onClick={() => setIsEditingAbout(true)}
                            className="px-4 py-1 text-sm border border-dark-500 rounded-md hover:bg-gray-800"
                        >
                            Edit
                        </button>
                    )}
                </div>
                {isEditingAbout ? (
                    <div className="space-y-4">
                        <textarea
                            value={aboutMeText}
                            onChange={(e) => setAboutMeText(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md bg-transparent outline-none"
                            rows={4}
                            placeholder="Tell us about yourself..."
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsEditingAbout(false)}
                                className="px-4 py-2 text-sm border rounded-md hover:bg-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditAboutMe}
                                disabled={!aboutMeText}
                                className="px-4 py-2 text-sm bg-brand-500 text-white rounded-md hover:bg-brand-500"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-600">
                        {portfolio.aboutMe || "No description provided."}
                    </p>
                )}
            </div>

            {portfolioSections.map((section) => (
                <PortfolioSection
                    key={section}
                    title={section.charAt(0).toUpperCase() + section.slice(1)}
                    items={portfolio[section]}
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