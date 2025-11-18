const { spawn } = require('child_process');
const { request } = require('undici');
const { deepStrictEqual } = require('assert');

async function runTest() {
  // Start the server
  const server = spawn('npm', ['run', 'start'], { shell: true });
  let serverReady = false;

  server.stdout.on('data', (data) => {
    if (data.toString().includes('started server on')) {
      serverReady = true;
    }
  });

  // Wait for the server to be ready
  while (!serverReady) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  try {
    // Make a request to the home page
    const { statusCode, body } = await request('http://localhost:3000');
    const bodyText = await body.text();

    // Assert that the request was successful
    deepStrictEqual(statusCode, 200, 'Expected status code 200');
    console.log('Test passed!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Close the server
    server.kill();
  }
}

runTest();