"use client";

import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    onPageChange: (page: number) => void;
};

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }: PaginationProps) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) {
        return null; // Don't render pagination if there's only one page
    }

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div className="flex items-center justify-center space-x-4 mt-8">
            <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="flex items-center justify-center p-2 bg-[#0D1321] border border-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
            >
                <ChevronLeft size={20} className="text-slate-300" />
            </button>

            <span className="text-slate-300">
                Page {currentPage} of {totalPages}
            </span>

            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center p-2 bg-[#0D1321] border border-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
            >
                <ChevronRight size={20} className="text-slate-300" />
            </button>
        </div>
    );
};

export default Pagination;