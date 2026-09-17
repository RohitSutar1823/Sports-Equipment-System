const http = require('http');

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({ status: res.statusCode, data: parsed });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING BACKEND API VERIFICATION ---');

  // 1. Health check
  const health = await request('GET', '/api/health');
  console.log('1. Health Check:', health.status, health.data.message);

  // 2. Dashboard Stats
  const stats = await request('GET', '/api/dashboard/stats');
  console.log('2. Dashboard Stats:', stats.status, {
    totalUnits: stats.data.totalEquipmentUnits,
    availableUnits: stats.data.availableEquipmentUnits,
    currentlyIssued: stats.data.itemsCurrentlyIssued,
    activeBookings: stats.data.activeBookings,
    pendingFines: stats.data.pendingFinesCount
  });

  // 3. Equipment initial state
  const equipBefore = await request('GET', '/api/equipment/1');
  console.log('3. Yonex Racket initial available qty:', equipBefore.data.Available_Quantity);
  const initialQty = equipBefore.data.Available_Quantity;

  // 4. Test Stock Decrement on Issue (Issue 2 rackets to Student 2)
  console.log('4. Issuing 2 units of Equipment 1 to Student 2...');
  const issueRes = await request('POST', '/api/issues', {
    Student_ID: 2,
    Equipment_ID: 1,
    Issue_Date: '2026-09-17',
    Quantity: 2
  });
  console.log('   Issue Created Response:', issueRes.status, 'Issue_ID:', issueRes.data.Issue_ID);

  const equipAfterIssue = await request('GET', '/api/equipment/1');
  console.log('   Yonex Racket available qty after issue:', equipAfterIssue.data.Available_Quantity);
  if (equipAfterIssue.data.Available_Quantity !== initialQty - 2) {
    throw new Error('Stock decrement failed!');
  }
  console.log('   Stock successfully decremented by 2.');

  // 5. Test Stock Shortage Rejection
  console.log('5. Testing rejection when requested qty exceeds available stock (requesting 9999)...');
  const rejectRes = await request('POST', '/api/issues', {
    Student_ID: 2,
    Equipment_ID: 1,
    Issue_Date: '2026-09-17',
    Quantity: 9999
  });
  console.log('   Rejection Status:', rejectRes.status, 'Message:', rejectRes.data.message);
  if (rejectRes.status !== 400) {
    throw new Error('Over-request was not rejected with 400!');
  }
  console.log('   Stock shortage rejection verified.');

  // 6. Test Equipment Return + Stock Increment + Late Return Fine
  console.log('6. Returning issue with return date 12 days later (Late return test)...');
  // Issue date was 2026-09-17; return on 2026-09-29 -> 12 days (> 7 days allowed window)
  const returnRes = await request('PUT', `/api/issues/${issueRes.data.Issue_ID}`, {
    Return_Date: '2026-09-29',
    Is_Damaged: false
  });
  console.log('   Return Status:', returnRes.status, 'Message:', returnRes.data.message);
  console.log('   Fines automatically generated:', returnRes.data.finesCreated);

  const equipAfterReturn = await request('GET', '/api/equipment/1');
  console.log('   Yonex Racket available qty after return:', equipAfterReturn.data.Available_Quantity);
  if (equipAfterReturn.data.Available_Quantity !== initialQty) {
    throw new Error('Stock replenishment failed!');
  }
  console.log('   Stock replenishment verified.');
  if (returnRes.data.finesCreated.length === 0) {
    throw new Error('Automated late fine was not created!');
  }
  console.log('   Automated late fine verified.');

  // 7. Test Damaged Equipment Return Fine
  console.log('7. Issuing 1 unit of Equipment 5 (Basketball) and returning as Damaged...');
  const issue2 = await request('POST', '/api/issues', {
    Student_ID: 3,
    Equipment_ID: 5,
    Issue_Date: '2026-09-17',
    Quantity: 1
  });
  const return2 = await request('PUT', `/api/issues/${issue2.data.Issue_ID}`, {
    Return_Date: '2026-09-18', // within 1 day (not late)
    Is_Damaged: true,
    Damage_Description: 'Cracked valve and surface puncture',
    Damage_Cost: 175.00,
    New_Condition: 'Damaged'
  });
  console.log('   Damage Return Status:', return2.status, 'Fines:', return2.data.finesCreated);
  if (return2.data.finesCreated.length === 0 || parseFloat(return2.data.finesCreated[0].Amount) !== 175) {
    throw new Error('Damage fine was not properly created!');
  }
  console.log('   Damage fine verified.');

  // 8. Test Fines Update (Mark as Paid)
  const damageFineId = return2.data.finesCreated[0].Fine_ID;
  const payFineRes = await request('PUT', `/api/fines/${damageFineId}`, {
    Status: 'Paid'
  });
  console.log('8. Mark Fine as Paid:', payFineRes.status, 'New Status:', payFineRes.data.Status);
  if (payFineRes.data.Status !== 'Paid') {
    throw new Error('Failed to mark fine as paid!');
  }

  // 9. Test Lecture Schedules
  const schedulesRes = await request('GET', '/api/schedules');
  console.log('9. Lecture Schedules count:', schedulesRes.data.length, 'Sample:', schedulesRes.data[0]?.Subject);

  console.log('\n ALL BACKEND TESTS PASSED SUCCESSFULLY! \n');
  process.exit(0);
}

// Wait for server to start, then run
setTimeout(runTests, 1500);
