// Grant
// {
//  "patientId": "12.12.98-123U",
//  "professionalId": "12345678901",
//  "scope": [
//    "healthcare",
//    "prescriptions"
//  ],
//  "permissions": ["read", "write"],
//  "startsAt": "2022-11-18T12:00:00",
//  "endsAt": "2022-11-19T12:00:00"
// }

export type Patient = string;
export type Professional = string;
export type GrantId = number;

export enum Scope {
    Healthcare,
    Prescriptions
}

export enum Permission {
    Read,
    Write
}

export enum ApprovalStatus {
    Approved,
    Revoked,
    Denied,
    Pending
}

export class Grant {
    patientId: string;
    professionalId: string;
    scope: Scope[];
    permissions: Permission[];
    startsAt: Date;
    endsAt: Date;
    createdAt: Date;
    updatedAt: Date;
    approvalStatus: ApprovalStatus;
    grantId: GrantId;


    constructor(
        patientId: string,
        professionalId: string,
        startsAt: Date,
        endsAt: Date,
        scope: Scope[],
        permissions: Permission[],
        grantId: GrantId,
    ) {
        this.patientId = patientId;
        this.professionalId = professionalId;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        this.scope = scope;
        this.permissions = permissions;
        this.grantId = grantId;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.approvalStatus = ApprovalStatus.Pending;
    }
}


