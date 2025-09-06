import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { 
  Project, 
  ProjectCategory, 
  ProjectFilter, 
  ProjectSortOptions 
} from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectsMockService {

  private mockProjects: Project[] = [
    {
      id: '1',
      title: 'E-commerce Platform',
      description: 'Plataforma completa de comercio electrónico con carrito de compras, pasarela de pagos integrada, gestión de inventario en tiempo real, sistema de reviews y calificaciones. Incluye panel de administración completo para gestionar productos, órdenes y usuarios.',
      shortDescription: 'Plataforma completa de e-commerce con carrito y pagos',
      images: [
        {
          id: '1-1',
          url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
          alt: 'E-commerce Platform Dashboard',
          isPrimary: true,
          order: 1
        },
        {
          id: '1-2', 
          url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
          alt: 'Shopping Cart Interface',
          isPrimary: false,
          order: 2
        },
        {
          id: '1-3',
          url: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800',
          alt: 'Product Catalog',
          isPrimary: false,
          order: 3
        }
      ],
      category: ProjectCategory.WEB_APP,
      technologies: ['Angular', 'Node.js', 'MongoDB', 'Stripe', 'Tailwind CSS'],
      demoUrl: 'https://demo-ecommerce.example.com',
      repoUrl: 'https://github.com/example/ecommerce',
      featured: true,
      createdAt: new Date('2024-08-15'),
      updatedAt: new Date('2024-08-25'),
      stats: {
        views: 1250,
        likes: 89,
        shares: 34
      }
    },
    {
      id: '2',
      title: 'Task Management App',
      description: 'Aplicación de gestión de tareas con funcionalidades avanzadas como boards tipo Kanban, asignación de tareas a equipos, seguimiento de progreso, notificaciones en tiempo real, calendario integrado y reportes de productividad.',
      shortDescription: 'App de gestión de tareas con boards Kanban',
      images: [
        {
          id: '2-1',
          url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800',
          alt: 'Kanban Board Interface',
          isPrimary: true,
          order: 1
        },
        {
          id: '2-2',
          url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
          alt: 'Task Details View',
          isPrimary: false,
          order: 2
        }
      ],
      category: ProjectCategory.WEB_APP,
      technologies: ['React', 'Express.js', 'PostgreSQL', 'Socket.io', 'Material-UI'],
      demoUrl: 'https://tasks-demo.example.com',
      repoUrl: 'https://github.com/example/task-manager',
      featured: true,
      createdAt: new Date('2024-07-20'),
      updatedAt: new Date('2024-08-01'),
      stats: {
        views: 987,
        likes: 76,
        shares: 23
      }
    },
    {
      id: '3',
      title: 'Weather Mobile App',
      description: 'Aplicación móvil del clima con pronósticos precisos, mapas interactivos de lluvia y temperatura, alertas meteorológicas personalizadas, widgets para pantalla de inicio y funcionalidad offline para consultas básicas.',
      shortDescription: 'App móvil del clima con pronósticos y alertas',
      images: [
        {
          id: '3-1',
          url: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800',
          alt: 'Weather App Main Screen',
          isPrimary: true,
          order: 1
        },
        {
          id: '3-2',
          url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
          alt: 'Weather Map View',
          isPrimary: false,
          order: 2
        }
      ],
      category: ProjectCategory.MOBILE_APP,
      technologies: ['Flutter', 'Dart', 'OpenWeather API', 'Firebase'],
      demoUrl: 'https://play.google.com/store/apps/weather-demo',
      repoUrl: 'https://github.com/example/weather-app',
      featured: false,
      createdAt: new Date('2024-06-10'),
      updatedAt: new Date('2024-07-15'),
      stats: {
        views: 654,
        likes: 45,
        shares: 12
      }
    },
    {
      id: '4',
      title: 'Brand Identity Design',
      description: 'Diseño completo de identidad corporativa incluyendo logo, paleta de colores, tipografías, papelería empresarial, guía de marca y aplicaciones en diferentes medios digitales y físicos.',
      shortDescription: 'Identidad corporativa completa con logo y guía de marca',
      images: [
        {
          id: '4-1',
          url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
          alt: 'Brand Logo Design',
          isPrimary: true,
          order: 1
        },
        {
          id: '4-2',
          url: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800',
          alt: 'Brand Guidelines',
          isPrimary: false,
          order: 2
        }
      ],
      category: ProjectCategory.DESIGN,
      technologies: ['Adobe Illustrator', 'Adobe Photoshop', 'Figma', 'InDesign'],
      demoUrl: 'https://behance.net/brand-identity-demo',
      featured: false,
      createdAt: new Date('2024-05-05'),
      updatedAt: new Date('2024-05-30'),
      stats: {
        views: 432,
        likes: 67,
        shares: 18
      }
    },
    {
      id: '5',
      title: 'REST API Authentication',
      description: 'API REST completa con sistema de autenticación JWT, autorización basada en roles, documentación con Swagger, rate limiting, validación de datos y middleware de seguridad avanzado.',
      shortDescription: 'API REST con autenticación JWT y documentación',
      images: [
        {
          id: '5-1',
          url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
          alt: 'API Documentation',
          isPrimary: true,
          order: 1
        }
      ],
      category: ProjectCategory.API,
      technologies: ['Node.js', 'Express', 'JWT', 'Swagger', 'MongoDB'],
      repoUrl: 'https://github.com/example/auth-api',
      featured: false,
      createdAt: new Date('2024-04-12'),
      updatedAt: new Date('2024-04-25'),
      stats: {
        views: 789,
        likes: 56,
        shares: 29
      }
    },
    {
      id: '6',
      title: 'Puzzle Game 2D',
      description: 'Juego de puzzle 2D con múltiples niveles de dificultad, sistema de puntuación, efectos de sonido, animaciones fluidas y modo multijugador local. Incluye editor de niveles personalizado.',
      shortDescription: 'Juego de puzzle 2D con múltiples niveles',
      images: [
        {
          id: '6-1',
          url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
          alt: 'Puzzle Game Screenshot',
          isPrimary: true,
          order: 1
        },
        {
          id: '6-2',
          url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
          alt: 'Game Level Editor',
          isPrimary: false,
          order: 2
        }
      ],
      category: ProjectCategory.GAME,
      technologies: ['Unity', 'C#', 'Photon', 'DOTween'],
      demoUrl: 'https://play.google.com/store/apps/puzzle-demo',
      repoUrl: 'https://github.com/example/puzzle-game',
      featured: true,
      createdAt: new Date('2024-03-08'),
      updatedAt: new Date('2024-04-01'),
      stats: {
        views: 1100,
        likes: 92,
        shares: 41
      }
    },
    {
      id: '7',
      title: 'Blog Personal',
      description: 'Blog personal con sistema de comentarios, categorías, tags, búsqueda avanzada, newsletter, modo oscuro/claro y optimización SEO completa. Incluye panel de administración para gestión de contenido.',
      shortDescription: 'Blog personal con comentarios y SEO optimizado',
      images: [
        {
          id: '7-1',
          url: 'https://images.unsplash.com/photo-1486312338219-ce68e2c6f44d?w=800',
          alt: 'Blog Homepage',
          isPrimary: true,
          order: 1
        },
        {
          id: '7-2',
          url: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800',
          alt: 'Blog Post View',
          isPrimary: false,
          order: 2
        }
      ],
      category: ProjectCategory.WEB_APP,
      technologies: ['Next.js', 'TypeScript', 'Prisma', 'Tailwind CSS', 'Vercel'],
      demoUrl: 'https://personal-blog-demo.vercel.app',
      repoUrl: 'https://github.com/example/personal-blog',
      featured: false,
      createdAt: new Date('2024-02-14'),
      updatedAt: new Date('2024-03-01'),
      stats: {
        views: 567,
        likes: 38,
        shares: 15
      }
    },
    {
      id: '8',
      title: 'Fitness Tracker App',
      description: 'Aplicación móvil para seguimiento de ejercicios con planes de entrenamiento personalizados, contador de calorías, integración con wearables, progreso visual y comunidad social para motivación.',
      shortDescription: 'App de fitness con seguimiento de ejercicios',
      images: [
        {
          id: '8-1',
          url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
          alt: 'Fitness App Dashboard',
          isPrimary: true,
          order: 1
        },
        {
          id: '8-2',
          url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800',
          alt: 'Workout Tracking',
          isPrimary: false,
          order: 2
        }
      ],
      category: ProjectCategory.MOBILE_APP,
      technologies: ['React Native', 'Firebase', 'Redux', 'HealthKit'],
      demoUrl: 'https://expo.dev/@example/fitness-tracker',
      repoUrl: 'https://github.com/example/fitness-app',
      featured: true,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-02-10'),
      stats: {
        views: 834,
        likes: 71,
        shares: 26
      }
    },
    {
      id: '9',
      title: 'UI Kit Components',
      description: 'Librería completa de componentes UI reutilizables con documentación interactiva, múltiples temas, tokens de diseño, accesibilidad integrada y compatibilidad con diferentes frameworks.',
      shortDescription: 'Librería de componentes UI con documentación',
      images: [
        {
          id: '9-1',
          url: 'https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=800',
          alt: 'UI Components Library',
          isPrimary: true,
          order: 1
        },
        {
          id: '9-2',
          url: 'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?w=800',
          alt: 'Design System Documentation',
          isPrimary: false,
          order: 2
        }
      ],
      category: ProjectCategory.DESIGN,
      technologies: ['Storybook', 'React', 'Styled Components', 'TypeScript'],
      demoUrl: 'https://ui-kit-demo.netlify.app',
      repoUrl: 'https://github.com/example/ui-kit',
      featured: false,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-25'),
      stats: {
        views: 612,
        likes: 84,
        shares: 31
      }
    },
    {
      id: '10',
      title: 'GraphQL API Gateway',
      description: 'API Gateway con GraphQL que unifica múltiples microservicios, incluye sistema de caché inteligente, subscripciones en tiempo real, autenticación federada y monitoreo de performance.',
      shortDescription: 'Gateway GraphQL para microservicios con caché',
      images: [
        {
          id: '10-1',
          url: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800',
          alt: 'GraphQL Schema Visualization',
          isPrimary: true,
          order: 1
        }
      ],
      category: ProjectCategory.API,
      technologies: ['GraphQL', 'Apollo Server', 'Redis', 'Docker', 'Kubernetes'],
      repoUrl: 'https://github.com/example/graphql-gateway',
      featured: false,
      createdAt: new Date('2023-12-10'),
      updatedAt: new Date('2023-12-28'),
      stats: {
        views: 445,
        likes: 52,
        shares: 19
      }
    },
    {
      id: '11',
      title: 'Real Estate Platform',
      description: 'Plataforma inmobiliaria completa con búsqueda avanzada de propiedades, mapas interactivos, tours virtuales 360°, sistema de citas, calculadora de hipotecas y portal para agentes inmobiliarios.',
      shortDescription: 'Plataforma inmobiliaria con tours virtuales y mapas',
      images: [
        {
          id: '11-1',
          url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
          alt: 'Real Estate Property Listing',
          isPrimary: true,
          order: 1
        },
        {
          id: '11-2',
          url: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800',
          alt: 'Interactive Property Map',
          isPrimary: false,
          order: 2
        },
        {
          id: '11-3',
          url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
          alt: 'Property Details View',
          isPrimary: false,
          order: 3
        }
      ],
      category: ProjectCategory.WEB_APP,
      technologies: ['Vue.js', 'Laravel', 'MySQL', 'Google Maps API', 'AWS S3'],
      demoUrl: 'https://realestate-demo.example.com',
      repoUrl: 'https://github.com/example/realestate-platform',
      featured: true,
      createdAt: new Date('2024-09-01'),
      updatedAt: new Date('2024-09-15'),
      stats: {
        views: 1567,
        likes: 134,
        shares: 67
      }
    },
    {
      id: '12',
      title: 'Cryptocurrency Wallet',
      description: 'Billetera digital para criptomonedas con soporte para múltiples blockchain, intercambio integrado, staking de tokens, historial detallado de transacciones y medidas de seguridad avanzadas.',
      shortDescription: 'Billetera crypto con intercambio y staking',
      images: [
        {
          id: '12-1',
          url: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800',
          alt: 'Crypto Wallet Dashboard',
          isPrimary: true,
          order: 1
        },
        {
          id: '12-2',
          url: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=800',
          alt: 'Trading Interface',
          isPrimary: false,
          order: 2
        }
      ],
      category: ProjectCategory.MOBILE_APP,
      technologies: ['React Native', 'Web3.js', 'Ethereum', 'Node.js', 'MongoDB'],
      demoUrl: 'https://testflight.apple.com/crypto-wallet-demo',
      repoUrl: 'https://github.com/example/crypto-wallet',
      featured: true,
      createdAt: new Date('2024-08-20'),
      updatedAt: new Date('2024-09-05'),
      stats: {
        views: 2134,
        likes: 189,
        shares: 95
      }
    },
    {
      id: '13',
      title: 'Learning Management System',
      description: 'Sistema completo de gestión de aprendizaje con cursos interactivos, evaluaciones automáticas, progreso de estudiantes, videoconferencias integradas, gamificación y certificados digitales.',
      shortDescription: 'LMS con cursos interactivos y certificaciones',
      images: [
        {
          id: '13-1',
          url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
          alt: 'LMS Course Dashboard',
          isPrimary: true,
          order: 1
        },
        {
          id: '13-2',
          url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
          alt: 'Student Progress Tracking',
          isPrimary: false,
          order: 2
        },
        {
          id: '13-3',
          url: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800',
          alt: 'Video Lesson Interface',
          isPrimary: false,
          order: 3
        }
      ],
      category: ProjectCategory.WEB_APP,
      technologies: ['Django', 'Python', 'PostgreSQL', 'WebRTC', 'Redis', 'Celery'],
      demoUrl: 'https://lms-demo.example.com',
      repoUrl: 'https://github.com/example/lms-platform',
      featured: true,
      createdAt: new Date('2024-07-10'),
      updatedAt: new Date('2024-08-30'),
      stats: {
        views: 1789,
        likes: 156,
        shares: 78
      }
    },
    {
      id: '14',
      title: 'Social Media Analytics',
      description: 'Dashboard de analytics para redes sociales que integra múltiples plataformas, análisis de sentimientos, reportes automáticos, predicción de tendencias y recomendaciones de contenido.',
      shortDescription: 'Analytics dashboard para redes sociales',
      images: [
        {
          id: '14-1',
          url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
          alt: 'Social Media Analytics Dashboard',
          isPrimary: true,
          order: 1
        },
        {
          id: '14-2',
          url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
          alt: 'Engagement Metrics Chart',
          isPrimary: false,
          order: 2
        }
      ],
      category: ProjectCategory.WEB_APP,
      technologies: ['React', 'D3.js', 'Python', 'TensorFlow', 'Firebase', 'Chart.js'],
      demoUrl: 'https://social-analytics-demo.netlify.app',
      repoUrl: 'https://github.com/example/social-analytics',
      featured: false,
      createdAt: new Date('2024-06-25'),
      updatedAt: new Date('2024-07-20'),
      stats: {
        views: 892,
        likes: 73,
        shares: 34
      }
    },
    {
      id: '15',
      title: 'Recipe Sharing App',
      description: 'Aplicación móvil para compartir recetas con funciones de búsqueda por ingredientes, lista de compras automática, temporizadores de cocina, valoraciones de usuarios y modo offline.',
      shortDescription: 'App de recetas con lista de compras y temporizadores',
      images: [
        {
          id: '15-1',
          url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
          alt: 'Recipe App Home Screen',
          isPrimary: true,
          order: 1
        },
        {
          id: '15-2',
          url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800',
          alt: 'Recipe Detail View',
          isPrimary: false,
          order: 2
        },
        {
          id: '15-3',
          url: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800',
          alt: 'Cooking Timer Interface',
          isPrimary: false,
          order: 3
        }
      ],
      category: ProjectCategory.MOBILE_APP,
      technologies: ['Flutter', 'Firebase', 'Dart', 'SQLite', 'Cloud Firestore'],
      demoUrl: 'https://play.google.com/store/apps/recipe-demo',
      repoUrl: 'https://github.com/example/recipe-app',
      featured: false,
      createdAt: new Date('2024-05-15'),
      updatedAt: new Date('2024-06-10'),
      stats: {
        views: 678,
        likes: 94,
        shares: 42
      }
    },
    {
      id: '16',
      title: 'Portfolio Website Template',
      description: 'Template de sitio web portfolio con diseño minimalista, múltiples layouts, galería de proyectos, blog integrado, formulario de contacto y optimización para motores de búsqueda.',
      shortDescription: 'Template de portfolio minimalista con blog',
      images: [
        {
          id: '16-1',
          url: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800',
          alt: 'Portfolio Homepage Design',
          isPrimary: true,
          order: 1
        },
        {
          id: '16-2',
          url: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800',
          alt: 'Portfolio Projects Gallery',
          isPrimary: false,
          order: 2
        }
      ],
      category: ProjectCategory.DESIGN,
      technologies: ['HTML5', 'CSS3', 'JavaScript', 'SASS', 'Gulp'],
      demoUrl: 'https://portfolio-template-demo.github.io',
      repoUrl: 'https://github.com/example/portfolio-template',
      featured: false,
      createdAt: new Date('2024-04-08'),
      updatedAt: new Date('2024-05-01'),
      stats: {
        views: 543,
        likes: 67,
        shares: 28
      }
    },
    {
      id: '17',
      title: 'Inventory Management API',
      description: 'API REST para gestión de inventarios con control de stock en tiempo real, alertas automáticas, integración con proveedores, reportes de movimientos y sincronización multi-almacén.',
      shortDescription: 'API de inventarios con control de stock en tiempo real',
      images: [
        {
          id: '17-1',
          url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800',
          alt: 'Inventory API Documentation',
          isPrimary: true,
          order: 1
        }
      ],
      category: ProjectCategory.API,
      technologies: ['FastAPI', 'Python', 'PostgreSQL', 'Docker', 'OpenAPI'],
      repoUrl: 'https://github.com/example/inventory-api',
      featured: false,
      createdAt: new Date('2024-03-20'),
      updatedAt: new Date('2024-04-15'),
      stats: {
        views: 634,
        likes: 48,
        shares: 22
      }
    },
    {
      id: '18',
      title: 'Tower Defense Game',
      description: 'Juego de tower defense con múltiples tipos de torres, enemigos únicos, sistema de mejoras, modo campaña y desafíos diarios. Incluye efectos visuales espectaculares y banda sonora original.',
      shortDescription: 'Tower defense con campaña y desafíos diarios',
      images: [
        {
          id: '18-1',
          url: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800',
          alt: 'Tower Defense Game Screenshot',
          isPrimary: true,
          order: 1
        },
        {
          id: '18-2',
          url: 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=800',
          alt: 'Game Tower Upgrade Menu',
          isPrimary: false,
          order: 2
        },
        {
          id: '18-3',
          url: 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=800',
          alt: 'Battle Scene',
          isPrimary: false,
          order: 3
        }
      ],
      category: ProjectCategory.GAME,
      technologies: ['Unity', 'C#', 'Blender', 'FMOD', 'Unity Analytics'],
      demoUrl: 'https://tower-defense-demo.itch.io',
      repoUrl: 'https://github.com/example/tower-defense',
      featured: true,
      createdAt: new Date('2024-02-28'),
      updatedAt: new Date('2024-04-10'),
      stats: {
        views: 1456,
        likes: 198,
        shares: 87
      }
    },
    {
      id: '19',
      title: 'Event Management Platform',
      description: 'Plataforma completa para gestión de eventos con registro de participantes, venta de boletos, check-in QR, streaming en vivo, networking entre asistentes y analytics de participación.',
      shortDescription: 'Plataforma de eventos con streaming y networking',
      images: [
        {
          id: '19-1',
          url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
          alt: 'Event Management Dashboard',
          isPrimary: true,
          order: 1
        },
        {
          id: '19-2',
          url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
          alt: 'Event Registration Interface',
          isPrimary: false,
          order: 2
        },
        {
          id: '19-3',
          url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
          alt: 'Live Streaming Interface',
          isPrimary: false,
          order: 3
        }
      ],
      category: ProjectCategory.WEB_APP,
      technologies: ['Angular', 'Spring Boot', 'MySQL', 'WebRTC', 'Stripe', 'AWS'],
      demoUrl: 'https://event-platform-demo.heroku.com',
      repoUrl: 'https://github.com/example/event-platform',
      featured: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-02-20'),
      stats: {
        views: 1298,
        likes: 145,
        shares: 73
      }
    },
    {
      id: '20',
      title: 'Meditation & Wellness App',
      description: 'Aplicación de bienestar con meditaciones guiadas, música relajante, seguimiento del estado de ánimo, recordatorios personalizables, progreso de meditación y comunidad de usuarios.',
      shortDescription: 'App de meditación con seguimiento del bienestar',
      images: [
        {
          id: '20-1',
          url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68e71?w=800',
          alt: 'Meditation App Home Screen',
          isPrimary: true,
          order: 1
        },
        {
          id: '20-2',
          url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
          alt: 'Meditation Session Interface',
          isPrimary: false,
          order: 2
        }
      ],
      category: ProjectCategory.MOBILE_APP,
      technologies: ['React Native', 'Expo', 'Firebase', 'Redux Toolkit', 'React Navigation'],
      demoUrl: 'https://expo.dev/@example/meditation-app',
      repoUrl: 'https://github.com/example/meditation-app',
      featured: false,
      createdAt: new Date('2023-12-20'),
      updatedAt: new Date('2024-01-10'),
      stats: {
        views: 756,
        likes: 112,
        shares: 45
      }
    },
    {
      id: '21',
      title: 'Smart Home Dashboard',
      description: 'Dashboard para control de casa inteligente con monitoreo de dispositivos IoT, automatizaciones personalizadas, ahorro de energía, seguridad integrada y control por voz.',
      shortDescription: 'Dashboard IoT para casa inteligente con automatizaciones',
      images: [
        {
          id: '21-1',
          url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
          alt: 'Smart Home Control Dashboard',
          isPrimary: true,
          order: 1
        },
        {
          id: '21-2',
          url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800',
          alt: 'Energy Monitoring Interface',
          isPrimary: false,
          order: 2
        }
      ],
      category: ProjectCategory.WEB_APP,
      technologies: ['Vue.js', 'Node.js', 'MQTT', 'InfluxDB', 'Grafana', 'Socket.io'],
      demoUrl: 'https://smarthome-demo.vercel.app',
      repoUrl: 'https://github.com/example/smarthome-dashboard',
      featured: false,
      createdAt: new Date('2023-11-28'),
      updatedAt: new Date('2023-12-15'),
      stats: {
        views: 523,
        likes: 67,
        shares: 31
      }
    },
    {
      id: '22',
      title: 'Brand Guidelines System',
      description: 'Sistema completo de guías de marca con paleta de colores interactiva, tipografías web, componentes de UI, plantillas descargables, generador de logos y documentación para equipos.',
      shortDescription: 'Sistema de guías de marca con componentes interactivos',
      images: [
        {
          id: '22-1',
          url: 'https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=800',
          alt: 'Brand Guidelines Interface',
          isPrimary: true,
          order: 1
        },
        {
          id: '22-2',
          url: 'https://images.unsplash.com/photo-1586717791821-3de98c5a11b0?w=800',
          alt: 'Color Palette Generator',
          isPrimary: false,
          order: 2
        },
        {
          id: '22-3',
          url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800',
          alt: 'Typography Showcase',
          isPrimary: false,
          order: 3
        }
      ],
      category: ProjectCategory.DESIGN,
      technologies: ['Figma', 'Adobe Creative Suite', 'Sketch', 'Principle', 'Zeplin'],
      demoUrl: 'https://brand-guidelines-demo.design',
      featured: false,
      createdAt: new Date('2023-10-10'),
      updatedAt: new Date('2023-11-05'),
      stats: {
        views: 445,
        likes: 89,
        shares: 37
      }
    }
  ];

  constructor() { }

  getAllProjects(): Observable<Project[]> {
    return of(this.mockProjects).pipe(delay(800));
  }

  getFeaturedProjects(): Observable<Project[]> {
    return of(this.mockProjects.filter(project => project.featured)).pipe(delay(600));
  }

  getProjectById(id: string): Observable<Project | undefined> {
    return of(this.mockProjects.find(project => project.id === id)).pipe(delay(400));
  }

  getProjectsByCategory(category: ProjectCategory): Observable<Project[]> {
    return of(this.mockProjects.filter(project => project.category === category)).pipe(delay(500));
  }

  searchProjects(filters: ProjectFilter): Observable<Project[]> {
    let filteredProjects = [...this.mockProjects];

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filteredProjects = filteredProjects.filter(project =>
        project.title.toLowerCase().includes(term) ||
        project.description.toLowerCase().includes(term) ||
        project.technologies.some(tech => tech.toLowerCase().includes(term))
      );
    }

    if (filters.category) {
      filteredProjects = filteredProjects.filter(project => project.category === filters.category);
    }

    if (filters.technologies && filters.technologies.length > 0) {
      filteredProjects = filteredProjects.filter(project =>
        filters.technologies!.some(tech =>
          project.technologies.some(projectTech =>
            projectTech.toLowerCase().includes(tech.toLowerCase())
          )
        )
      );
    }

    if (filters.featured !== undefined) {
      filteredProjects = filteredProjects.filter(project => project.featured === filters.featured);
    }

    return of(filteredProjects).pipe(delay(700));
  }

  getSortedProjects(sortOptions: ProjectSortOptions): Observable<Project[]> {
    return this.getAllProjects().pipe(
      map(projects => {
        return projects.sort((a, b) => {
          let valueA: any;
          let valueB: any;

          switch (sortOptions.field) {
            case 'createdAt':
              valueA = a.createdAt.getTime();
              valueB = b.createdAt.getTime();
              break;
            case 'title':
              valueA = a.title.toLowerCase();
              valueB = b.title.toLowerCase();
              break;
            case 'views':
              valueA = a.stats.views;
              valueB = b.stats.views;
              break;
            case 'likes':
              valueA = a.stats.likes;
              valueB = b.stats.likes;
              break;
            default:
              return 0;
          }

          if (sortOptions.direction === 'asc') {
            return valueA > valueB ? 1 : -1;
          } else {
            return valueA < valueB ? 1 : -1;
          }
        });
      })
    );
  }

  getProjectCategories(): ProjectCategory[] {
    return Object.values(ProjectCategory);
  }

  getAllTechnologies(): string[] {
    const techSet = new Set<string>();
    this.mockProjects.forEach(project => {
      project.technologies.forEach(tech => techSet.add(tech));
    });
    return Array.from(techSet).sort();
  }
}