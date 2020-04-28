import React from "react";
import SummaryCard from "../../ui-components/cards/summary-card.component";
import SummaryCardRow from "../../ui-components/cards/summary-card-row.component";
import { performPatientAllergySearch } from "./allergy-intolerance.resource";
import style from "./allergies-overview.css";
import HorizontalLabelValue from "../../ui-components/cards/horizontal-label-value.component";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { useCurrentPatient } from "@openmrs/esm-api";
import { useRouteMatch } from "react-router-dom";
import AllergyForm from "./allergy-form.component";
import { openWorkspaceTab } from "../shared-utils";

export default function AllergiesOverview(props: AllergiesOverviewProps) {
  const [patientAllergy, setPatientAllergy] = React.useState(null);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();

  const match = useRouteMatch();
  const chartBasePath =
    match.url.substr(0, match.url.search("/chart/")) + "/chart";
  const allergiesPath = chartBasePath + "/" + props.basePath;

  React.useEffect(() => {
    if (patient) {
      const abortController = new AbortController();

      performPatientAllergySearch(patient.identifier[0].value, abortController)
        .then(allergy => setPatientAllergy(allergy.data))
        .catch(createErrorHandler());

      return () => abortController.abort();
    }
  }, [patient]);

  return (
    <SummaryCard
      name="Allergies"
      styles={{ margin: "1.25rem, 1.5rem" }}
      link={`/patient/${patientUuid}/chart/allergies`}
      addComponent={AllergyForm}
      showComponent={() => {
        openWorkspaceTab(AllergyForm, "Allergy Form", {
          allergyUuid: null
        });
      }}
    >
      {patientAllergy &&
        patientAllergy.total > 0 &&
        patientAllergy.entry.map(allergy => {
          return (
            <SummaryCardRow
              key={allergy.resource.id}
              linkTo={`${allergiesPath}/details/${allergy.resource.id}`}
            >
              <HorizontalLabelValue
                label={allergy.resource.code.text}
                labelClassName="omrs-bold"
                labelStyles={{ flex: "1" }}
                value={`${
                  allergy.resource.reaction[0].manifestation[0].text
                } (${
                  allergy.resource.criticality === "?"
                    ? "\u2014"
                    : allergy.resource.criticality
                })`}
                valueStyles={{ flex: "1", paddingLeft: "1rem" }}
                valueClassName={style.allergyReaction}
              />
            </SummaryCardRow>
          );
        })}
    </SummaryCard>
  );
}

type AllergiesOverviewProps = { basePath: string };
