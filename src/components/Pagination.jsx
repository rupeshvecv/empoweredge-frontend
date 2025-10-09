import React from 'react';
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
    }
  };

  const buttonClasses = "bg-indigo-500 text-white rounded-lg p-2 cursor-pointer font-bold transition-colors duration-200 w-10 h-10 flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#9575cd]";
  const inputClasses = "w-10 h-10 text-center border border-gray-300 rounded-lg p-1 text-base text-gray-700";
  const infoClasses = "text-base text-gray-700 mx-2";

  return (
    <div className="flex items-center gap-2 mt-4 justify-end">
      <button
        className={buttonClasses}
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
      >
        {'<<'}
      </button>
      <button
        className={buttonClasses}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        {'<'}
      </button>
      <input
        type="text"
        value={currentPage}
        readOnly
        className={inputClasses}
      />
      <span className={infoClasses}>
        Page {currentPage} of {totalPages}
      </span>
      <button
        className={buttonClasses}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        {'>'}
      </button>
      <button
        className={buttonClasses}
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        {'>>'}
      </button>
    </div>
  );
};

export default Pagination;
