import { Worker, NearAccount, NEAR } from 'near-workspaces';
import anyTest, { TestFn } from 'ava';
import { rootCertificates } from 'tls';

enum Scope {
  Healthcare,
  Prescriptions
}

enum Permission {
  Read,
  Write
}

// enum ApprovalStatus {
//   Approved,
//   Revoked,
//   Denied,
//   Pending
// }

// type Patient = string;
// type Professional = string;
type GrantId = number;

// class Grant {

//   createdAt: Date;
//   updatedAt: Date;
//   approvalStatus: ApprovalStatus;
//   patientId: string;
//   professionalId: string;
//   startsAt: Date;
//   endsAt: Date;
//   scope: Scope[];
//   permissions: Permission[];
//   grantId: GrantId;


// }

const test = anyTest as TestFn<{
  worker: Worker;
  accounts: Record<string, NearAccount>;
}>;

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Deploy contract
  const root = worker.rootAccount;

  const professional = await root.createSubAccount("alice", {
    initialBalance: NEAR.parse("30 N").toJSON(),
  });

  const patient = await root.createSubAccount("bob", {
    initialBalance: NEAR.parse("30 N").toJSON(),
  });

  const contract = await root.createSubAccount("contract", {
    initialBalance: NEAR.parse("30 N").toJSON(),
  });
  // Get wasm file path from package.json test script in folder above
  await contract.deploy(
    process.argv[2],
  );

  // Save state for test runs, it is unique for each test
  t.context.worker = worker;
  t.context.accounts = { root, contract, patient, professional };
});

test.afterEach.always(async (t) => {
  // Stop Sandbox server
  await t.context.worker.tearDown().catch((error) => {
    console.log('Failed to stop the Sandbox:', error);
  });
});


// test('Register Patient', async (t) => {
//   const { root, contract, patient } = t.context.accounts;
//   await root.call(contract, 'register_patient', { patientId: patient.accountId });
//   const message: boolean = await contract.view('get_patient', { patientId: patient.accountId });
//   t.is(message, true);
// });

// test('Register Professional', async (t) => {
//   const { root, contract, professional } = t.context.accounts;
//   await root.call(contract, 'register_professional', { professionalId: professional.accountId });
//   const message: boolean = await contract.view('get_professional', { professionalId: professional.accountId });
//   t.is(message, true);
// });

test('Request Authorization', async (t) => {
  const { root, contract, professional, patient } = t.context.accounts;
  let startsAt = Date.now();

  await root.call(contract, 'register_patient', { patientId: patient.accountId });
  await root.call(contract, 'register_professional', { professionalId: professional.accountId });

  let grant: GrantId = await professional.call(contract, 'request_authorization', {
    patientId: patient.accountId,
    professionalId: professional.accountId,
    startsAt,
    endsAt: startsAt + 50000,
    scope: [Scope.Healthcare, Scope.Prescriptions],
    permissions: [Permission.Read, Permission.Write]
  });

  console.log(grant);


  let approved = await patient.call(contract, 'approve_authorization', {
    patientId: patient.accountId,
    grantId: grant
  });

  console.log(approved);

  let grants = await patient.call(contract, "get_grants", {
    patientId: patient.accountId,
  })

  console.log(grants);


});

