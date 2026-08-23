# SIGA - Sistema Integral de Gestión Aduanera (República Dominicana) 🇩🇴

Aplicación móvil desarrollada con **React Native**, **Expo Router** y **TypeScript**, inspirada en la **Dirección General de Aduanas de la República Dominicana (DGA)**.

---

## 🌟 Características Principales

- **Diseño Minimalista Institucional**: Paleta de colores oficial de Aduanas RD (`#8BC34A`, `#558B2F`, `#0D3B66`), tipografía limpia, sombras sutiles y gradientes.
- **Doble Rol de Usuario**:
  - **Importador OEA**: Registro de declaraciones aduaneras, cálculo automático de aranceles e ITBIS (18%), pago de tributos y subida de facturas/BLs.
  - **Oficial Verificador DGA**: Aforo documental y físico, aprobación/rechazo de expedientes, validación de pagos y control de módulos IGEA/IGRA.
- **Asistente Virtual "Alonso"**: Bot inteligente disponible en todo momento con respuestas contextuales sobre expedientes, tributos aduaneros, liquidaciones y normativas DGA.
- **Módulos IGEA & IGRA**:
  - **IGEA**: Informe de Gestión de Entrada Aduanera (ingreso de manifiesto y descarga en patio).
  - **IGRA**: Informe de Gestión de Retiro Aduanero (pase de salida autorizado).
- **Gestión de Pagos**: Consulta de balances pendientes, abonos parciales, pagos totales y validación con comprobante fiscal.
- **Buscador Avanzado**: Filtros por DUA, número de expediente, mercancía, consignatario y estado.
- **Persistencia Local**: Manejo reactivo de estado con `Context API` y persistencia con `AsyncStorage`.

---

## 🚀 Inicio Rápido

### 1. Instalación de dependencias
```bash
npm install
```

### 2. Iniciar la aplicación
```bash
# Iniciar en modo desarrollo con Expo
npx expo start

# Iniciar directamente en navegador web
npm run web

# Iniciar en emulador Android o iOS
npm run android
npm run ios
```

---

## 🔑 Credenciales de Prueba (Demo)

Puedes iniciar sesión con un solo toque en la pantalla de Login usando los botones rápidos o ingresando:

| Rol | Cédula / RNC | Contraseña | Nombre |
| :--- | :--- | :--- | :--- |
| **Importador** | `00112345678` | `123456` | Ricardo García (Caribe Import Logistics) |
| **Verificador DGA** | `00187654321` | `123456` | Lic. María González (Dirección General de Aduanas) |

> 💡 *En la pantalla de Perfil también dispones de un selector en vivo para alternar entre roles al instante.*

---

## 📁 Estructura del Proyecto

```
SIGA/
├── app/                        # Rutas de Expo Router
│   ├── (auth)/login.tsx        # Login estilizado con diseño Aduanas RD
│   ├── (tabs)/                 # Barra de pestañas principal + Alonso Bot
│   │   ├── index.tsx           # Dashboard de métricas y flujos
│   │   ├── expedientes.tsx     # Gestión y listado de expedientes
│   │   ├── pagos.tsx           # Liquidación de impuestos y tributos
│   │   ├── modulos.tsx         # Módulos IGEA e IGRA
│   │   ├── buscador.tsx        # Buscador avanzado multi-criterio
│   │   └── perfil.tsx          # Perfil de usuario y cambio de rol demo
│   └── expedientes/
│       ├── [id].tsx            # Detalle completo con 8 secciones aduaneras
│       └── nuevo.tsx           # Registro de nuevo expediente y liquidación
├── components/ui/              # Componentes UI reutilizables
│   ├── AlonsoChatBot.tsx       # Asistente virtual inteligente
│   ├── CustomsLogo.tsx         # Logo oficial Aduanas República Dominicana
│   ├── Button.tsx              # Botón con gradientes y estados
│   ├── Card.tsx                # Tarjeta minimalista con elevación
│   ├── StatusBadge.tsx         # Badges de estados aduaneros
│   ├── FileUpload.tsx          # Selector de documentos (PDF/Imágenes)
│   ├── FilePreview.tsx         # Previsualizador de archivos
│   └── ProfileEditModal.tsx    # Modal de edición de perfil
├── contexts/
│   ├── AuthContext.tsx         # Sesión y roles de usuario
│   └── DataContext.tsx         # Modelo de datos, persistencia y CRUD
├── theme/
│   └── colors.ts               # Paleta de colores institucionales DGA
├── types/
│   └── index.ts                # Tipos TypeScript
└── app.json
```
