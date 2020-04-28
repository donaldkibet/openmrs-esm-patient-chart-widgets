import React from "react";
import { Link, useRouteMatch } from "react-router-dom";
import { performPatientAllergySearch } from "./allergy-intolerance.resource";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import styles from "./allergies-detailed-summary.css";
import SummaryCard from "../../ui-components/cards/summary-card.component";
import dayjs from "dayjs";
import { useCurrentPatient } from "@openmrs/esm-api";
import AllergyForm from "./allergy-form.component";
import { openWorkspaceTab } from "../shared-utils";

export default function AllergiesDetailedSummary(
  props: AllergiesDetailedSummaryProps
) {
  const [patientAllergy, setPatientAllergy] = React.useState(null);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();
  const match = useRouteMatch();

  React.useEffect(() => {
    if (!isLoadingPatient && patient) {
      const abortController = new AbortController();

      performPatientAllergySearch(patient.identifier[0].value, abortController)
        .then(allergy => setPatientAllergy(allergy.data))
        .catch(createErrorHandler());

      return () => abortController.abort();
    }
  }, [isLoadingPatient, patient]);

  function displayAllergy() {
    return (
      <SummaryCard
        name="Allergies"
        styles={{ width: "100%" }}
        addComponent={AllergyForm}
        showComponent={() =>
          openWorkspaceTab(AllergyForm, "Allergy Form", {
            allergyUuid: null
          })
        }
      >
        <table className={styles.allergyTable}>
          <thead>
            <tr>
              <td>ALLERGEN</td>
              <td>
                <div className={styles.centerItems}>
                  SEVERITY & REACTION
                  <svg className="omrs-icon" fill="rgba(0, 0, 0, 0.54)">
                    <use xlinkHref="#omrs-icon-arrow-downward" />
                  </svg>
                </div>
              </td>
              <td>SINCE</td>
              <td>UPDATED</td>
            </tr>
          </thead>
          <tbody>
            {patientAllergy &&
              patientAllergy.entry.map(allergy => {
                return (
                  <React.Fragment key={allergy.resource.id}>
                    <tr
                      className={`${
                        allergy.resource.criticality === "high"
                          ? `${styles.high}`
                          : `${styles.low}`
                      }`}
                    >
                      <td className={"omrs-bold"}>
                        {allergy.resource.code.text}
                      </td>
                      <td>
                        <div
                          className={`${styles.centerItems} ${
                            allergy.resource.criticality === "high"
                              ? `omrs-bold`
                              : ``
                          }`}
                          style={{ textTransform: "uppercase" }}
                        >
                          {allergy.resource.criticality === "high" && (
                            <svg
                              className={`omrs-icon`}
                              fontSize={"15px"}
                              fill="rgba(181, 7, 6, 1)"
                            >
                              <use xlinkHref="#omrs-icon-important-notification" />
                            </svg>
                          )}
                          {allergy.resource.criticality}
                        </div>
                      </td>
                      <td>
                        {dayjs(
                          allergy.resource.extension[0].valueDateTime
                        ).format("MMM-YYYY")}
                      </td>
                      <td>
                        <div
                          className={`${styles.centerItems} ${styles.alignRight}`}
                        >
                          <span>
                            {dayjs(patientAllergy.meta.lastUpdated).format(
                              "DD-MMM-YYYY"
                            )}
                          </span>

                          <Link
                            to={`${match.path}/details/${allergy.resource.id}`}
                          >
                            <svg
                              className="omrs-icon"
                              fill="rgba(0, 0, 0, 0.54)"
                            >
                              <use xlinkHref="#omrs-icon-chevron-right" />
                            </svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td colSpan={3}>
                        {Object.values(
                          allergy.resource.reaction[0].manifestation.map(
                            manifestation => manifestation.text
                          )
                        ).join(", ")}
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td colSpan={3}>
                        <span className={`${styles.allergyComment}`}>
                          <span style={{ whiteSpace: "pre-line" }}>
                            {allergy.resource.note &&
                              allergy.resource.note[0].text}
                          </span>
                          <Link
                            className="omrs-unstyled"
                            to={`${match.path}/details/${allergy.resource.id}`}
                          >
                            more ...
                          </Link>
                        </span>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
          </tbody>
        </table>
        <div className={`allergyFooter ${styles.allergyFooter}`}>
          <p>No more allergies available</p>
        </div>
      </SummaryCard>
    );
  }

  function displayNoAllergenHistory() {
    return (
      <SummaryCard
        name="Allergies"
        styles={{ width: "100%" }}
        addComponent={AllergyForm}
        showComponent={() =>
          openWorkspaceTab(AllergyForm, "Allergy Form", {
            allergyUuid: null
          })
        }
      >
        <div className={styles.allergyMargin}>
          <p className="omrs-bold">
            The patient's allergy history is not documented.
          </p>
          <p className="omrs-bold">
            <button
              style={{ cursor: "pointer" }}
              className="omrs-btn omrs-outlined-action"
              type="button"
              onClick={() =>
                openWorkspaceTab(AllergyForm, "Allergy Form", {
                  allergyUuid: null
                })
              }
            >
              Add allergy history
            </button>
          </p>
        </div>
      </SummaryCard>
    );
  }

  return (
    <>
      {patientAllergy && (
        <div className={styles.allergySummary}>
          {patientAllergy.total > 0
            ? displayAllergy()
            : displayNoAllergenHistory()}
        </div>
      )}
    </>
  );
}

type AllergiesDetailedSummaryProps = {};
