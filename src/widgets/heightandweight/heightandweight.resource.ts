import { openmrsObservableFetch, fhirConfig } from "@openmrs/esm-api";
import { map } from "rxjs/operators";
import { formatDate, calculateBMI } from "./heightandweight-helper";

const HEIGHT_CONCEPT = "5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const WEIGHT_CONCEPT = "5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export function getDimensions(patientId: string) {
  return getDimensionsObservations(patientId).pipe(
    map(data => (data ? formatDimensions(data.weights, data.heights) : []))
  );
}

function getDimensionsObservations(patientId: string) {
  return openmrsObservableFetch<DimensionFetchResponse>(
    `${fhirConfig.baseUrl}/Observation?subject:Patient=${patientId}&code=${WEIGHT_CONCEPT},${HEIGHT_CONCEPT}`
  ).pipe(
    map(({ data }) => data.entry),
    map((entries: Array<Dimension>) =>
      entries.map((entry: Dimension) => entry.resource)
    ),
    map(dimensions => {
      return {
        heights: dimensions.filter(dimension =>
          dimension.code.coding.some(sys => sys.code === HEIGHT_CONCEPT)
        ),
        weights: dimensions.filter(dimension =>
          dimension.code.coding.some(sys => sys.code === WEIGHT_CONCEPT)
        )
      };
    })
  );
}

function formatDimensions(weights, heights) {
  const weightDates = getDatesIssued(weights);
  const heightDates = getDatesIssued(heights);
  const uniqueDates = Array.from(new Set(weightDates.concat(heightDates))).sort(
    latestFirst
  );

  return uniqueDates.map(date => {
    const weight = weights.find(weight => weight.issued === date);
    const height = heights.find(height => height.issued === date);
    return {
      id: new Date(date).getTime(),
      weight: weight ? weight.valueQuantity.value : weight,
      height: height ? height.valueQuantity.value : height,
      date: formatDate(date),
      bmi:
        weight && height
          ? calculateBMI(weight.valueQuantity.value, height.valueQuantity.value)
          : null,
      obsData: {
        weight: weight,
        height: height
      }
    };
  });
}

function latestFirst(a, b) {
  return new Date(b).getTime() - new Date(a).getTime();
}

function getDatesIssued(dimensionArray): string[] {
  return dimensionArray.map(dimension => dimension.issued);
}

type DimensionFetchResponse = {
  entry: Array<Dimension>;
  id: string;
  resourceType: string;
  total: Number;
  type: string;
};

type Dimension = {
  resource: {
    code: { coding: Array<Code> };
    effectiveDateTime: Date;
    encounter: {
      reference: string;
      type: string;
    };
    id: string;
    issued: Date;
    referenceRange: any;
    resourceType: string;
    status: string;
    subject: {
      display: string;
      identifier: { id: string; system: string; use: string; value: string };
      reference: string;
      type: string;
    };
    valueQuantity: {
      value: Number;
    };
  };
};

type Code = {
  code: string;
  system: string;
};
