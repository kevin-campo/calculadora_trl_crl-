# TRL & CRL Assessment Platform - Documentación Detallada

## 🚀 Descripción General del Software
Este software es una plataforma integral de evaluación de madurez tecnológica (**TRL - Technology Readiness Level**) y madurez comercial (**CRL - Commercial Readiness Level**). Su objetivo principal es permitir a investigadores, emprendedores y empresas diagnosticar el estado actual de sus proyectos de innovación a través de un marco estructurado de preguntas y análisis de datos.

La plataforma combina un frontend moderno construido con **Next.js** y un backend escalable utilizando **Firebase (Firestore & Auth)**. Proporciona una interfaz intuitiva para realizar diagnósticos, visualizar resultados mediante gráficos de radar y gestionar el historial de proyectos de forma segura.

### Funcionalidades Clave:
- **Calculadora Inteligente**: Un motor de diagnóstico que procesa múltiples dimensiones de madurez para generar niveles precisos de TRL y CRL.
- **Panel Administrativo (Real-time)**: Supervisión en tiempo real de usuarios, diagnósticos y organizaciones activas con capacidades de gestión total.
- **Visualización de Datos**: Gráficos dinámicos (Radar, Áreas, Barras) para interpretar el rendimiento de los proyectos.
- **Sistema de Perfiles**: Gestión personalizada donde cada usuario puede ver su historial, editar sus datos y eliminar proyectos antiguos.
- **Reportes Ejecutivos**: Generación de reportes visuales listos para impresión o guardado como PDF con el diseño fiel de la plataforma.

---

## 🛠️ Cambios Realizados Hoy (2026-05-09)

### 1. Gestión Administrativa Avanzada
- **Soporte Real-time**: Implementé `onSnapshot` de Firebase para que el Admin Dashboard se actualice instantáneamente cuando hay nuevos registros o diagnósticos.
- **Control Total**: El administrador ahora puede **desactivar**, **eliminar** y **cambiar roles** de usuarios directamente desde la interfaz.
- **Gestión de Diagnósticos**: Capacidad de ver el desglose detallado de cada respuesta y eliminar diagnósticos específicos.
- **Gestión de Empresas**: Filtros dinámicos para ver diagnósticos por organización y eliminación masiva de datos por empresa.

### 2. Renovación de Interfaz de Usuario (UI/UX)
- **Sistema de Notificaciones (Toasts)**: Añadimos notificaciones animadas con barra de progreso que aparecen al realizar acciones (guardar, editar, eliminar).
- **Modales de Confirmación**: Reemplazamos las alertas feas del navegador por modales personalizados, elegantes y centrados.
- **Rediseño de Mi Perfil**: Una interfaz completamente nueva, más limpia, con tarjetas de proyectos modernas y efectos visuales mejorados.
- **Secciones de Blog y Soporte**: Actualizamos el diseño de estas páginas para que sean coherentes con la nueva estética premium.
- **Navbar con Blur**: El menú de navegación ahora tiene un efecto de desenfoque (backdrop-blur) permanente que le da un toque sofisticado.

### 3. Sistema de Pruebas y Datos (Seeding)
- **Carpeta `test/`**: Creamos un entorno de pruebas robusto.
- **Firebase Admin SDK**: Configuramos el acceso de administrador para los scripts de prueba, permitiendo saltarse las reglas de seguridad de Firestore durante el desarrollo.
- **Scripts de Inserción**: Automatizamos la carga de usuarios y diagnósticos ficticios para validar el funcionamiento del sistema.

---

## 📦 Instalación y Dependencias

Para poner en marcha el proyecto localmente, sigue estos pasos:

### 1. Requisitos Previos
- **Node.js**: Versión 20 o superior.
- **NPM**: Incluido con Node.js.

### 2. Instalación de dependencias
Ejecuta el siguiente comando en la raíz del proyecto:
```bash
npm install
```

### 3. Configuración del Entorno
Debes crear un archivo `.env.local` en la raíz con tus credenciales de Firebase:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```

---

## 🧪 Sistema de Tests y Funcionamiento

Hemos implementado una suite de pruebas para asegurar que la lógica de negocio y la base de datos funcionen correctamente.

### ¿Cómo funcionan los tests?
Los tests están divididos en dos categorías:
1.  **Validación Lógica**: Verifican que los roles se asignen bien según el email y que los cálculos de la calculadora TRL/CRL sean matemáticamente exactos.
2.  **Seeding (Carga de Datos)**: Insertan datos reales en tu Firestore para que puedas ver el dashboard lleno y funcionando.

### Ejecución de los tests
Para correr todas las pruebas y cargar datos de ejemplo, usa el comando:
```bash
npm run test:seed
```

**Nota sobre Seguridad**: Para que los tests de inserción funcionen con reglas de Firebase restrictivas, debes colocar tu archivo `serviceAccountKey.json` (descargado desde la consola de Firebase) en la raíz del proyecto. El script detectará automáticamente si tiene permisos de administrador.

---

## 🚀 Comandos Útiles
- `npm run dev`: Inicia el servidor de desarrollo en `http://localhost:3000`.
- `npm run build`: Genera la versión de producción optimizada.
- `npm run test:seed`: Ejecuta las validaciones y carga datos de prueba.

holaaa