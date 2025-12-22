#!/usr/bin/env node

/**
 * Script de prueba local para verificar que el servidor funciona correctamente
 * Uso: node test-local.js
 */

import http from 'http';

const PORT = process.env.PORT || 3001;
const BASE_URL = `http://localhost:${PORT}`;

const tests = [
  {
    name: 'Health Check',
    url: `${BASE_URL}/api/health`,
    expectedStatus: 200,
  },
  {
    name: 'Health Check con Debug',
    url: `${BASE_URL}/api/health?debug=true`,
    expectedStatus: 200,
  },
  {
    name: 'Frontend - Ruta raíz',
    url: `${BASE_URL}/`,
    expectedStatus: 200,
  },
  {
    name: 'Frontend - Ruta de login',
    url: `${BASE_URL}/login`,
    expectedStatus: 200,
  },
];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function runTests() {
  console.log('🧪 Iniciando pruebas locales...\n');
  console.log(`📍 Servidor: ${BASE_URL}\n`);
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}...`);
      const response = await makeRequest(test.url);
      
      if (response.statusCode === test.expectedStatus) {
        console.log(`✅ PASS: ${test.name} (${response.statusCode})\n`);
        passed++;
        
        // Mostrar información adicional para el debug endpoint
        if (test.url.includes('debug=true')) {
          try {
            const json = JSON.parse(response.body);
            console.log('📊 Información de Debug:');
            console.log(`   - Directorio actual: ${json.currentDirectory}`);
            console.log(`   - Frontend encontrado: ${json.hasFrontendBuild ? 'Sí' : 'No'}`);
            if (json.frontendPath) {
              console.log(`   - Ruta del frontend: ${json.frontendPath}`);
            }
            console.log(`   - Rutas probadas: ${json.possiblePaths?.length || 0}\n`);
          } catch (e) {
            // No es JSON, está bien
          }
        }
      } else {
        console.log(`❌ FAIL: ${test.name}`);
        console.log(`   Esperado: ${test.expectedStatus}, Obtenido: ${response.statusCode}\n`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ERROR: ${test.name}`);
      console.log(`   ${error.message}\n`);
      failed++;
    }
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Pruebas pasadas: ${passed}`);
  console.log(`❌ Pruebas fallidas: ${failed}`);
  console.log(`📊 Total: ${passed + failed}\n`);
  
  if (failed === 0) {
    console.log('🎉 ¡Todas las pruebas pasaron! El servidor está funcionando correctamente.');
    process.exit(0);
  } else {
    console.log('⚠️  Algunas pruebas fallaron. Revisa los errores arriba.');
    process.exit(1);
  }
}

// Verificar que el servidor esté corriendo
console.log('⏳ Esperando 2 segundos para que el servidor inicie...\n');
setTimeout(() => {
  runTests().catch((error) => {
    console.error('Error ejecutando pruebas:', error);
    process.exit(1);
  });
}, 2000);

