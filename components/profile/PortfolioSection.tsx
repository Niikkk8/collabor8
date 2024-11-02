import { useState } from 'react';
import { PortfolioItem } from '@/types';
import Image from 'next/image';

interface PortfolioSectionProps {
    title: string;
    items: PortfolioItem[];
    isEditable: boolean;
    onEdit: (id: string, item: PortfolioItem) => void;
    onAdd: () => void;
    onDelete: (id: string) => void;
}

const PortfolioSection = ({
    title,
    items,
    isEditable,
    onEdit,
    onAdd,
    onDelete
}: PortfolioSectionProps) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

    const handleEditClick = (item: PortfolioItem) => {
        setEditingItem(item);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = () => {
        if (editingItem) {
            onEdit(editingItem.id, editingItem);
            setIsEditModalOpen(false);
            setEditingItem(null);
        }
    };

    return (
        <div className="bg-dark-800 rounded-lg shadow-lg mb-8">
            <div className="p-6 border-b border-dark-500">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white-100">{title}</h2>
                    {isEditable && (
                        <button
                            onClick={onAdd}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white-100 bg-dark-500 border border-dark-400 rounded-md hover:bg-dark-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 focus:ring-offset-dark-700 transition-colors"
                        >
                            Add New
                            <Image src={'/assets/svgs/add.svg'} height={18} width={18} alt='' />
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6 space-y-4">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="bg-dark-700 rounded-lg p-4 hover:shadow-xl transition-shadow"
                    >
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-lg text-white-100">
                                        {item.title}
                                    </h3>
                                    {item.date && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-dark-400 text-white-100">
                                            {item.date}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-white-700 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                            {isEditable && (
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => handleEditClick(item)}
                                        className="p-2 text-white-700 hover:bg-dark-400 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 focus:ring-offset-dark-700"
                                    >
                                        <Image src={'/assets/svgs/edit.svg'} height={18} width={18} alt='' />
                                        <span className="sr-only">Edit</span>
                                    </button>
                                    <button
                                        onClick={() => onDelete(item.id)}
                                        className="p-2 text-error-400 hover:bg-dark-400 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500 focus:ring-offset-dark-700"
                                    >
                                        <Image src={'/assets/svgs/trash.svg'} height={18} width={18} alt='' />
                                        <span className="sr-only">Delete</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isEditModalOpen && editingItem && (
                <>
                    <div
                        className="fixed inset-0 bg-dark-900 bg-opacity-75 transition-opacity backdrop-blur-sm"
                        onClick={() => setIsEditModalOpen(false)}
                    />
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <div className="relative transform overflow-hidden rounded-lg bg-dark-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-dark-400">
                                <div className="px-4 pb-4 pt-5 sm:p-6">
                                    <h3 className="text-lg font-semibold text-white-100 mb-4">
                                        Edit {title} Item
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-white-400 mb-1">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={editingItem.title}
                                                onChange={(e) => setEditingItem({
                                                    ...editingItem,
                                                    title: e.target.value
                                                })}
                                                className="block w-full rounded-md bg-transparent border border-dark-400 shadow-sm py-2 px-3 text-white-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-white-400 mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                value={editingItem.description}
                                                onChange={(e) => setEditingItem({
                                                    ...editingItem,
                                                    description: e.target.value
                                                })}
                                                rows={3}
                                                className="block w-full rounded-md bg-transparent border border-dark-400 shadow-sm py-2 px-3 text-white-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-white-400 mb-1">
                                                Date
                                            </label>
                                            <input
                                                type="text"
                                                value={editingItem.date || ""}
                                                onChange={(e) => setEditingItem({
                                                    ...editingItem,
                                                    date: e.target.value
                                                })}
                                                placeholder="e.g., Jan 2024 - Present"
                                                className="block w-full rounded-md bg-transparent border border-dark-400 shadow-sm py-2 px-3 text-white-100 placeholder-white-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-dark-500 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-dark-400">
                                    <button
                                        type="button"
                                        onClick={handleSaveEdit}
                                        className="inline-flex w-full justify-center rounded-md bg-brand-500 px-3 py-2 text-sm font-semibold text-white-100 shadow-sm hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 focus:ring-offset-dark-700 sm:ml-3 sm:w-auto"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-dark-500 px-3 py-2 text-sm font-semibold text-white-100 shadow-sm ring-1 ring-inset ring-dark-400 hover:bg-dark-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 focus:ring-offset-dark-700 sm:mt-0 sm:w-auto"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PortfolioSection;