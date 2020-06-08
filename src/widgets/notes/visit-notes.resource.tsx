import { openmrsFetch, openmrsObservableFetch } from "@openmrs/esm-api";
import { map } from "rxjs/operators";
import { visitNotePayload } from "./visit-note.util";
import { LocationData, Providers } from "../types";
import { Observable } from "rxjs";

const CONCEPT_REFERENCE_TERM = "ICD-10-WHO";

export function fetchAllLoccations(abortController: AbortController) {
  return openmrsFetch<{ results: Array<LocationData> }>(
    "/ws/rest/v1/location?v=custom:(uuid,display)",
    {
      signal: abortController.signal
    }
  );
}
export function fetchAllProviders(abortController: AbortController) {
  return openmrsFetch<{ results: Array<Providers> }>(
    "/ws/rest/v1/provider?v=custom:(person:(uuid,display),uuid)",
    {
      signal: abortController.signal
    }
  );
}

export function fetchDiagnosisByName(
  searchTerm: string
): Observable<Array<DiagnosisResult>> {
  return openmrsObservableFetch(
    `/coreapps/diagnoses/search.action?&term=${searchTerm}`
  ).pipe(
    map((response: any) => {
      return response.data.map(result => {
        const diagnosisResult: DiagnosisResult = {
          concept: result.concept,
          conceptReferenceTerm: getConceptReferenceTermCode(
            result.concept.conceptMappings
          ).conceptReferenceTerm.code,
          primary: false,
          confirmed: false
        };
        return diagnosisResult;
      });
    })
  );
}

export function fetchCurrentSessionData(abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/appui/session`, {
    signal: abortController.signal
  });
}

export function saveVisitNote(
  abortController: AbortController,
  payload: visitNotePayload
) {
  return openmrsFetch(`/ws/rest/v1/encounter`, {
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST",
    body: payload,
    signal: abortController.signal
  });
}

function getConceptReferenceTermCode(
  conceptMapping: Array<conceptMappings>
): conceptMappings {
  return conceptMapping.find(
    concept =>
      concept.conceptReferenceTerm.conceptSource.name === CONCEPT_REFERENCE_TERM
  );
}

export type DiagnosisResult = {
  concept: { id: string; uuid: string; preferredName: string };
  conceptReferenceTerm: string;
  confirmed: boolean;
  primary: boolean;
};

type conceptMappings = {
  conceptMapType: string;
  conceptReferenceTerm: {
    code: string;
    conceptSource: { name: string };
    name: string | null;
  };
};
