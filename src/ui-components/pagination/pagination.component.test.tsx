import React from "react";
import { screen, render } from "@testing-library/react";
import PatientChartPagination from "./pagination.component";

describe("<PatientChartPagination/>", () => {
  beforeEach(() => {
    render(<PatientChartPagination />);
  });
});
