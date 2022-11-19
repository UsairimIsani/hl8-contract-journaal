// Find all our documentation at https://docs.near.org
import { NearBindgen, near, call, view, UnorderedSet, Vector, LookupMap, } from 'near-sdk-js';
import { Grant, Professional, Patient, Scope, Permission, GrantId, ApprovalStatus } from './model';
@NearBindgen({})


class Journaal {
  grants: LookupMap<Grant[]> = new LookupMap<Grant[]>('grant-1');
  professional: UnorderedSet<Professional> = new UnorderedSet<Professional>('professional-1');
  patient: UnorderedSet<Patient> = new UnorderedSet<Patient>('patient-1');

  // Unsure who is allowed to see grant history
  @view({})
  get_grants({ patientId }: { patientId: Patient }): Grant[] {
    let signer = near.signerAccountId();
    let valid = this.professional.contains(signer) || (this.patient.contains(signer) && signer == patientId)
    if (valid) {
      return this.grants.get(patientId);
    } else {
      throw new Error("Unauthorized")
    }
  }

  // the signer should be in the grant i.e the professional or the patient
  @view({})
  get_grant({ patientId, grantId }: { patientId: Patient, grantId: GrantId }): Grant {
    let signer = near.signerAccountId();
    if (this.patient.contains(signer) && signer == patientId) {
      let grant = this.grants.get(patientId)[grantId];
      if (!grant) {
        return grant;
      }
      throw new Error("Grant Doesn't Exist");
    }
    else {
      throw new Error("Unauthorized");

    }

  }


  @view({})
  get_recent_grants({ patientId }: { patientId: Patient }): Grant[] {
    let signer = near.signerAccountId();
    let valid = this.professional.contains(signer) || (this.patient.contains(signer) && signer == patientId)
    if (valid) {
      return this.grants.get(patientId).slice(-10);
    } else {
      throw new Error("Unauthorized")
    }
  }


  @call({})
  request_authorization(
    { patientId,
      professionalId,
      startsAt,
      endsAt,
      scope,
      permissions,
    }: {
      patientId: string,
      professionalId: string,
      startsAt: Date,
      endsAt: Date,
      scope: Scope[],
      permissions: Permission[]
    }
  ): GrantId | Error {
    let signer = near.signerAccountId();
    if (signer == professionalId) {
      // && this.professional.contains(signer)) {

      let grants = this.grants.get(patientId) || [];
      let grantId = grants.length;

      let grant = new Grant(patientId,
        professionalId,
        startsAt,
        endsAt,
        scope,
        permissions,
        grantId
      );

      grants.push(grant);
      this.grants.set(patientId, grants);

      return grantId
    } else {
      throw new Error("Invalid Signer")
    }

  }

  @call({})
  approve_authorization({ patientId, grantId }: { patientId: Patient, grantId: GrantId }): GrantId | Error {
    let signer = near.signerAccountId()
    if (signer == patientId && this.patient.contains(signer)) {
      let grants = this.grants.get(patientId);
      try {
        grants[grantId].approvalStatus = ApprovalStatus.Approved;

      } catch (e) {
        throw new Error("Invalid grantId");
      }
      return grantId;
    } else {
      throw new Error("Invalid Signer")
    }
  }


  @call({})
  register_patient({ patientId }: { patientId: Patient }) {
    this.patient.set(patientId)

  }

  @view({})
  get_patient({ patientId }: { patientId: Patient }): boolean {
    return this.patient.contains(patientId)

  }

  @call({})
  register_professional({ professionalId }: { professionalId: Professional }) {
    this.professional.set(professionalId)

  }

  @view({})
  get_professional({ professionalId }: { professionalId: Professional }): boolean {
    return this.patient.contains(professionalId)

  }


}