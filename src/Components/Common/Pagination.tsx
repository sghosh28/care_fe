import { useState } from "react";
import CareIcon from "../../CAREUI/icons/CareIcon";
import { useAbortableEffect, statusType } from "../../Common/utils";
import ButtonV2 from "./components/ButtonV2";

interface PaginationProps {
  data: { totalCount: number };
  onChange: (page: number, rowsPerPage: number) => void;
  defaultPerPage: number;
  cPage: number;
  className?: string;
}
const Pagination = ({
  className = "mx-auto my-4",
  data,
  onChange,
  defaultPerPage,
  cPage,
}: PaginationProps) => {
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);

  useAbortableEffect(
    (status: statusType) => {
      if (!status.aborted) {
        if (defaultPerPage) {
          setRowsPerPage(defaultPerPage);
        }
        if (cPage) {
          setCurrentPage(parseInt(`${cPage}`));
        }
      }
    },
    [defaultPerPage, cPage]
  );

  const getPageNumbers = () => {
    const totalPage = Math.ceil(data.totalCount / rowsPerPage);
    if (totalPage === 0) return [1];

    const pageNumbers = [];

    if (currentPage === 1 && currentPage === totalPage) {
      pageNumbers.push(currentPage);
    } else if (currentPage === totalPage) {
      let tempPage = currentPage;
      let pageLimit = 3;
      while (tempPage >= 1 && pageLimit > 0) {
        pageNumbers.push(tempPage);
        tempPage--;
        pageLimit--;
      }
    } else {
      pageNumbers.push(currentPage);
      if (currentPage > 1) {
        pageNumbers.push(currentPage - 1);
        if (currentPage + 1 <= totalPage) {
          pageNumbers.push(currentPage + 1);
        }
      } else {
        pageNumbers.push(currentPage + 1);
        if (currentPage + 2 <= totalPage) {
          pageNumbers.push(currentPage + 2);
        }
      }
    }
    return pageNumbers.sort((a, b) => a - b);
  };

  const totalCount = data.totalCount;
  if (!totalCount) {
    return null;
  }
  const totalPage = Math.ceil(totalCount / rowsPerPage);
  const pageNumbers = getPageNumbers();

  const goToPage = (page: number) => {
    setCurrentPage(page);
    onChange(page, rowsPerPage);
    const pageContainer = window.document.getElementById("pages");
    pageContainer?.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className={className}>
      {/* Mobile view */}
      <div className="flex-1 flex justify-between sm:hidden">
        <NavButton
          tooltip="Previous"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage - 1 <= 0}
          children={<CareIcon className="care-l-angle-left text-lg" />}
        />
        <NavButton
          tooltip="Next"
          children={<CareIcon className="care-l-angle-right text-lg" />}
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage + 1 > totalPage}
        />
      </div>

      {/* Desktop view */}
      <nav className="hidden sm:flex-1 sm:items-center sm:justify-between relative sm:inline-flex rounded-lg bg-white border border-secondary-300">
        <NavButton
          tooltip="Jump to first page"
          children={<CareIcon className="care-l-angle-double-left text-lg" />}
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
        />
        <NavButton
          tooltip="Previous"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage - 1 <= 0}
          children={<CareIcon className="care-l-angle-left text-lg" />}
        />

        {pageNumbers.map((page) => (
          <NavButton
            key={page}
            onClick={() => goToPage(page)}
            selected={currentPage === page}
            tooltip={`Move to page ${page}`}
          >
            {page}
          </NavButton>
        ))}

        <NavButton
          tooltip="Next"
          children={<CareIcon className="care-l-angle-right text-lg" />}
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage + 1 > totalPage}
        />
        <NavButton
          tooltip="Jump to last page"
          children={<CareIcon className="care-l-angle-double-right text-lg" />}
          onClick={() => goToPage(totalPage)}
          disabled={totalPage === 0 || currentPage === totalPage}
        />
      </nav>
    </div>
  );
};

export default Pagination;

interface NavButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  tooltip: string;
  disabled?: boolean | undefined;
  selected?: boolean | undefined;
}

const NavButton = (props: NavButtonProps) => {
  return (
    <ButtonV2
      disabled={props.disabled}
      onClick={props.onClick}
      ghost={!props.selected}
      variant={props.selected === undefined ? "secondary" : "primary"}
      className="rounded-none text-sm font-bold tooltip"
    >
      {props.children}
      <span className="tooltip-text tooltip-bottom -translate-x-1/2 text-xs font-normal">
        {props.tooltip}
      </span>
    </ButtonV2>
  );
};
