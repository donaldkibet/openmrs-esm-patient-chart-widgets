import { useState, useEffect } from "react";
import { Subscription } from "rxjs";
import { openmrsObservableFetch } from "@openmrs/esm-api";
import { SessionData } from "../widgets/types";

export default function useSessionUser() {
  const [sessionUser, setSessionUser] = useState<SessionData>(null);
  useEffect(() => {
    let currentUserSub: Subscription;
    if (sessionUser === null) {
      currentUserSub = openmrsObservableFetch(
        "/ws/rest/v1/appui/session"
      ).subscribe((user: any) => {
        setSessionUser(user.data);
      });
    }
    return () => currentUserSub && currentUserSub.unsubscribe();
  }, [sessionUser]);
  return sessionUser;
}
