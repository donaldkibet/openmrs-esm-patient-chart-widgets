import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./pagination.component.scss";
import Pagination from "carbon-components-react/es/components/Pagination";
import { ConfigurableLink, useCurrentPatient } from "@openmrs/esm-framework";

interface PatientChartPaginationProps {
  data: Array<any>;
  onPageNumberChange?: any;
  pageSize: number;
  pageNumber: number;
}

const PatientChartPagination: React.FC<PatientChartPaginationProps> = ({
  data,
  pageSize,
  onPageNumberChange,
  pageNumber
}) => {
  const { t } = useTranslation();
  const [, , patientUuid] = useCurrentPatient();
  const chartBasePath = "${openmrsSpaBase}/patient/:patientUuid/chart/".replace(
    ":patientUuid",
    patientUuid
  );
  const [numberToShow, setNumberToShow] = React.useState(5);
  return (
    <div className={styles.paginationContainer}>
      <div className={styles.paginationLink}>
        {`${numberToShow} / ${data.length}`} {t("items", "Items")}
        <ConfigurableLink
          to={`${chartBasePath}results`}
          className="bx--side-nav__link"
        >
          {t("seeAll", "See all")}
        </ConfigurableLink>
      </div>
      <Pagination
        className={styles.pagination}
        page={pageNumber}
        pageSize={pageSize}
        pageSizes={[5, 10, 15, 20, 25]}
        totalItems={data.length + 1}
        onChange={onPageNumberChange}
      />
    </div>
  );
};

export default PatientChartPagination;
