# Proyecto final 
Competencia final 
## actividad-ecommerce
 
&gt; **Asignatura:** Programación II  
&gt; **Tema:** Programación Orientada a Objetos - Java POO

---
# 🌸 CherryBlossom ✨
🛍️Tienda Virtual de Entretenimiento Asiático




## 📖 Descripción

Cherry Blossom es una tienda virtual dedicada a la venta de productos relacionados con el entretenimiento asiático, incluyendo mangas, manhwas, merch de K-pop, álbumes musicales y figuras de anime.

La plataforma ofrece una experiencia intuitiva para explorar productos de forma rápida y organizada.

---

# 🎯 Objetivos

## 🎯 Objetivo General

Desarrollar una tienda virtual que permita a los usuarios explorar y adquirir productos relacionados con el entretenimiento asiático de manera fácil y rápida.

## 📌 Objetivos Específicos

- Diseñar una interfaz web atractiva e intuitiva
- Implementar una API REST con Spring Boot para la gestión de productos 
- Almacenar la información utilizando archivos locales
- Permitir la visualización y consulta de productos disponibles 
---

# ⚙️ Funcionalidades

- ✨ Visualización de productos
- 🔍 Búsqueda de artículos
- 📁 Gestión desde backend
- 📊 Lectura de archivos locales

---

# 🛠️ Tecnologías Utilizadas

| Área | Tecnologías |
|:----|:----------|
| **Backend** | Java, Spring Boot |
| **Frontend** | HTML, Tailwind CSS |
| **Persistencia** | JSON / CSV |
| **Herramientas** | NetBeans, VS Code |

---

# 🏗️ Arquitectura

- 🔹 Backend (API REST)
- 🔹 Frontend (Interfaz de usuario)

---

# 📁 Estructura del Proyecto

```
CherryBlossomStore/
│
├── 🌐 Frontend/ (Visual Studio Code)
│   ├── index.html       <-- Estructura, modales y maquetación (Tailwind)
│   ├── estilo.css       <-- Animaciones personalizadas y diseño premium
│   └── app.js           <-- Lógica de búsqueda, carrito, fetch y efectos
│
└── ☕ Backend/ (Apache NetBeans - Spring Boot)
    └── src/main/java/com/CherryBlossom/demo/
        │
        ├── DemoApplication.java         <-- Clase principal (arranca el servidor)
        │
        ├── 🎮 controller/               <-- Los "puentes" que reciben las peticiones
        │   ├── ProductoController.java
        │   └── UsuarioController.java
        │
        ├── 🧠 service/                  <-- Lógica de negocio (vender, validar)
        │   ├── ProductoService.java
        │   └── UsuarioService.java
        │
        ├── 📦 repository/               <-- El "almacén" de datos (Listas estáticas)
        │   ├── ProductoFileRepository.java
        │   └── UsuarioFileRepository.java
        │
        └── 🧩 modelos/ (o paquetes específicos)
            ├── productos/
            │   └── Producto.java        <-- Clase base de productos
            └── usuarios/
                ├── Usuario.java         <-- Clase padre
                ├── Administrador.java   <-- Hereda de Usuario
                └── Cliente.java         <-- Hereda de Usuario
```

---

# 🚀 Cómo Ejecutar

### 🔧 EL CEREBRO (Backend - NetBeans)

```
│
├── 🛠️ Preparación
│   └── Clic derecho en el proyecto -> "Clean and Build"
│
├── 🏃 Arranque
│   └── Ubicar 'DemoApplication.java' -> Clic derecho -> "Run File"
│
└── 📡 Verificación de Puerto
    └── En la consola debe decir: "Tomcat started on port(s): 8080"
``````

### 💻 LA INTERFAZ (Frontend - VS Code)

```
│
├── 📂 Apertura
│   └── Abrir la carpeta 'Frontend' en Visual Studio Code
│
├── ⚡ Lanzamiento
│   └── Clic derecho en 'index.html' -> "Open with Live Server"
│
└── 🔗 Enlace
    └── La web se abrirá en: http://127.0.0.1:5500/index.html
```
---

# 👩‍💻 Autores

- 👤 Mayleth Sofía Cabarcas Suárez
- 👤 Ruben Dario Arellano Marrugo

---

# 💡 Futuras Mejoras

- 🗄️ Base de datos
- 🔐 Mejorar login de usuarios
- 💳 Pagos online

-
---

# 📝 Licencia

Uso educativo

---

## ✨ “Donde la cultura asiática florece en cada clic” 🌸
