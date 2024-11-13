#include <WiFi.h>
#include <HTTPClient.h>
#include <ESP32Servo.h>
#include <time.h>

const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = -10800;  
const int daylightOffset_sec = 0;   


// Información Wi-Fi
const char* ssid = "NOMBRE_DE_TU_RED"; // IMPORTANTE CAMBIAR 
const char* password = "CONTRASEÑA_DE_TU_RED"; // IMPORTANTE CAMBIAR 

// URL del servidor
const char* serverURL = "http://TU_DIRECCION_IP:8080"; // IMPORTANTE CAMBIAR 

// Definir pines
const int pirPin = 23;
const int ledPin = 21;
const int ldrExteriorPin = 39;
const int ldrInteriorPin = 36;
const int servoPin = 22;

Servo servoMotor;

// Variables para detección de movimiento
int detecciones = 0;
unsigned long tiempoUltimaDeteccion = 0;
unsigned long intervalo5Min = 300000;
bool lucesEncendidas = false;
bool persianasAbiertas = false;
bool comprobandoLuzNatural = false;
unsigned long tiempoInicioApagadoTemporal = 0;
const unsigned long intervaloApagadoTemporal = 2000;
const unsigned long intervaloVerificacionLuzNatural = 15000;
unsigned long tiempoUltimaVerificacionLuzNatural = 0;

// verificación luces interior encendidas si exterior es oscuro
unsigned long tiempoAnteriorVerificacion = 0;
const unsigned long intervaloVerificacion = 1000; // Verificar cada 1 segundo (1000 ms)

// Umbrales para los sensores de luz
const int umbralLuzExteriorAlta = 3950;
const int umbralLuzInteriorMinima = 3000;

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Conectando a Wi-Fi...");
  }
  Serial.println("Conectado a Wi-Fi");

  pinMode(pirPin, INPUT);
  pinMode(ledPin, OUTPUT);
  servoMotor.attach(servoPin);

  // Configurar el tiempo con el servidor NTP
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);

  // Verificar si se sincronizó la hora
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Error al sincronizar la hora");
    return;
  }
  Serial.println("Hora sincronizada correctamente");
  Serial.printf("Hora actual: %02d:%02d:%02d\n", timeinfo.tm_hour, timeinfo.tm_min, timeinfo.tm_sec);

}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(serverURL) + "/api/getMode");
    int httpCode = http.GET();

    if (httpCode > 0) {
      String mode = http.getString();
      Serial.println("Modo actual: " + mode);

      if (mode == "manual") {
        controlarManual();
      } else if (mode == "auto") {
        controlarAutomatico();
      } else if (mode == "schedule") {
        controlarHorario();
      }
    } else {
      Serial.println("Error al conectar con el servidor");
    }
    http.end();
  }

  
  
  delay(1000);
}

void controlarManual() {
  HTTPClient http;
  http.begin(String(serverURL) + "/api/getManualStatus");
  int httpCode = http.GET();

  if (httpCode > 0) {
    String payload = http.getString();
    Serial.println("Estado manual recibido: " + payload);

    // Verificar el estado de las luces
    if (payload.indexOf("\"luces\":\"on\"") != -1) {
      digitalWrite(ledPin, HIGH);
      lucesEncendidas = true;
    } else {
      digitalWrite(ledPin, LOW);
      lucesEncendidas = false;
    }

    // Verificar el estado de las persianas
    if (payload.indexOf("\"persianas\":\"open\"") != -1) {
      servoMotor.write(180);
      persianasAbiertas = true;
    } else {
      servoMotor.write(0);
      persianasAbiertas = false;
    }
  } else {
    Serial.println("Error al obtener estado manual");
  }
  http.end();
}




void controlarAutomatico() {
    // Leer el estado del sensor de movimiento
  int pirValue = digitalRead(pirPin);
  
  // Leer los valores de los sensores de luz
  int ldrExteriorValue = analogRead(ldrExteriorPin);
  int ldrInteriorValue = analogRead(ldrInteriorPin);
  
  // Actualizar detecciones de movimiento
  if (pirValue == HIGH) {
    detecciones++;
    tiempoUltimaDeteccion = millis(); // Actualizar el tiempo de la última detección
    Serial.println("Movimiento detectado");
    delay(1000);
  }
  
  // Verificar si ha pasado el intervalo de 5 minutos
  if (millis() - tiempoUltimaDeteccion > intervalo5Min) {
    detecciones = 0; // Reiniciar el contador si pasó el intervalo sin nuevas detecciones
  }
  
  // Comprobar si el sistema debe estar activo
  if (detecciones >= 3) {
    // Sistema activo
    Serial.println("Sistema activo");
    
    // Si la luz exterior es alta y no se está realizando ya una verificación
    if (ldrExteriorValue > umbralLuzExteriorAlta && !comprobandoLuzNatural) {
      if (millis() - tiempoUltimaVerificacionLuzNatural > intervaloVerificacionLuzNatural) {
        // Iniciar la verificación temporal de la luz natural
        digitalWrite(ledPin, LOW); // Apagar las luces para verificar la luz natural
        lucesEncendidas = false;
        comprobandoLuzNatural = true;
        tiempoInicioApagadoTemporal = millis();
        Serial.println("Apagando luces temporalmente para verificar luz natural");
      }
    }

    // Si estamos comprobando la luz natural
    if (comprobandoLuzNatural) {
      // Comprobar si ha pasado el tiempo del apagado temporal
      if (millis() - tiempoInicioApagadoTemporal > intervaloApagadoTemporal) {
        // Verificar el nivel de luz interior sin las luces encendidas
        if (ldrInteriorValue <= umbralLuzInteriorMinima) {
          // La luz natural es suficiente, mantener las luces apagadas
          Serial.println("Luz natural suficiente, luces permanecen apagadas");
        } else {
          // La luz natural no es suficiente, volver a encender las luces
          digitalWrite(ledPin, HIGH);
          lucesEncendidas = true;
          Serial.println("Luz natural insuficiente, luces encendidas nuevamente");
        }
        // Finalizar la verificación de la luz natural
        comprobandoLuzNatural = false;
        tiempoUltimaVerificacionLuzNatural = millis();
      }
    }

    // Control de las persianas
    if (ldrExteriorValue > umbralLuzExteriorAlta && !persianasAbiertas) {
        servoMotor.write(180); // Abrir las persianas
        persianasAbiertas = true;
        Serial.println("Persianas abiertas");
    } else if (ldrExteriorValue <= umbralLuzExteriorAlta && persianasAbiertas) {
        // Si la luz exterior es baja, verificar las luces cada 1 segundo
        if (millis() - tiempoAnteriorVerificacion >= intervaloVerificacion) {
            tiempoAnteriorVerificacion = millis(); // Actualizar el tiempo de la última verificación
            if (!lucesEncendidas) {
                digitalWrite(ledPin, HIGH);
                lucesEncendidas = true;
                Serial.println("Luz exterior baja, luces encendidas");
            }
        }
        servoMotor.write(0); // Cerrar las persianas
        persianasAbiertas = false;
        Serial.println("Persianas cerradas");
    }

    if (ldrExteriorValue <= umbralLuzExteriorAlta && !persianasAbiertas) {
      if (millis() - tiempoAnteriorVerificacion >= intervaloVerificacion) {
            tiempoAnteriorVerificacion = millis(); // Actualizar el tiempo de la última verificación
            if (!lucesEncendidas) {
                digitalWrite(ledPin, HIGH);
                lucesEncendidas = true;
                Serial.println("Luz exterior baja, luces encendidas");
            }
        }
    }

  } else {
    // Si no se detecta movimiento durante el intervalo, apagar las luces y cerrar persianas
    if (lucesEncendidas) {
      digitalWrite(ledPin, LOW);
      lucesEncendidas = false;
      Serial.println("Sistema inactivo, luces apagadas");
    }
    if (persianasAbiertas) {
      servoMotor.write(0); // Cerrar las persianas
      persianasAbiertas = false;
      Serial.println("Sistema inactivo, persianas cerradas");
    }
  }
}

void controlarHorario() {
  HTTPClient http;
  http.begin(String(serverURL) + "/api/getScheduleStatus");
  int httpCode = http.GET();

  if (httpCode > 0) {
    String payload = http.getString();
    Serial.println("Estado de horario recibido: " + payload);

    // Extraer los horarios del payload
    int openLightsIndex = payload.indexOf("\"openTime\":\"");
    int closeLightsIndex = payload.indexOf("\"closeTime\":\"");
    int openShuttersIndex = payload.indexOf("\"openTime\":\"", openLightsIndex + 1);
    int closeShuttersIndex = payload.indexOf("\"closeTime\":\"", closeLightsIndex + 1);

    String openLightsTime = payload.substring(openLightsIndex + 12, payload.indexOf("\"", openLightsIndex + 12));
    String closeLightsTime = payload.substring(closeLightsIndex + 13, payload.indexOf("\"", closeLightsIndex + 13));
    String openShuttersTime = payload.substring(openShuttersIndex + 12, payload.indexOf("\"", openShuttersIndex + 12));
    String closeShuttersTime = payload.substring(closeShuttersIndex + 13, payload.indexOf("\"", closeShuttersIndex + 13));

    Serial.println("Horario de encendido de luces: " + openLightsTime);
    Serial.println("Horario de apagado de luces: " + closeLightsTime);
    Serial.println("Horario de apertura de persianas: " + openShuttersTime);
    Serial.println("Horario de cierre de persianas: " + closeShuttersTime);

    // Obtener la hora actual del ESP32
    struct tm timeinfo;
    if (!getLocalTime(&timeinfo)) {
      Serial.println("Error al obtener la hora");
      return;
    }
    char currentTime[6];
    strftime(currentTime, 6, "%H:%M", &timeinfo);

    // Control de luces basado en el horario
    if (String(currentTime) == openLightsTime) {
      digitalWrite(ledPin, HIGH);
      lucesEncendidas = true;
      Serial.println("Encendiendo luces por horario");
    } else if (String(currentTime) == closeLightsTime) {
      digitalWrite(ledPin, LOW);
      lucesEncendidas = false;
      Serial.println("Apagando luces por horario");
    }

    // Control de persianas basado en el horario
    if (String(currentTime) == openShuttersTime) {
      servoMotor.write(180); // Abrir persianas
      persianasAbiertas = true;
      Serial.println("Abriendo persianas por horario");
    } else if (String(currentTime) == closeShuttersTime) {
      servoMotor.write(0); // Cerrar persianas
      persianasAbiertas = false;
      Serial.println("Cerrando persianas por horario");
    }

  } else {
    Serial.println("Error al obtener estado de horario");
  }
  http.end();
}

