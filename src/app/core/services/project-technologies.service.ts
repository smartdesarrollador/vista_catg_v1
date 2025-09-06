import { Injectable } from '@angular/core';

export interface TechnologyInfo {
  name: string;
  category: TechCategory;
  color: string;
  icon?: string;
  count?: number;
}

export enum TechCategory {
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  DATABASE = 'database',
  MOBILE = 'mobile',
  DESIGN = 'design',
  DEVOPS = 'devops',
  BLOCKCHAIN = 'blockchain',
  AI_ML = 'ai-ml',
  GAME_DEV = 'game-dev',
  OTHER = 'other'
}

@Injectable({
  providedIn: 'root'
})
export class ProjectTechnologiesService {

  private technologies: TechnologyInfo[] = [
    // Frontend Technologies
    { name: 'Angular', category: TechCategory.FRONTEND, color: 'text-red-600', icon: '🅰️' },
    { name: 'React', category: TechCategory.FRONTEND, color: 'text-blue-500', icon: '⚛️' },
    { name: 'Vue.js', category: TechCategory.FRONTEND, color: 'text-green-500', icon: '💚' },
    { name: 'Next.js', category: TechCategory.FRONTEND, color: 'text-black', icon: '▲' },
    { name: 'TypeScript', category: TechCategory.FRONTEND, color: 'text-blue-600', icon: '🔷' },
    { name: 'JavaScript', category: TechCategory.FRONTEND, color: 'text-yellow-500', icon: '🟨' },
    { name: 'HTML5', category: TechCategory.FRONTEND, color: 'text-orange-500', icon: '🌐' },
    { name: 'CSS3', category: TechCategory.FRONTEND, color: 'text-blue-400', icon: '🎨' },
    { name: 'Tailwind CSS', category: TechCategory.FRONTEND, color: 'text-cyan-500', icon: '💨' },
    { name: 'SASS', category: TechCategory.FRONTEND, color: 'text-pink-500', icon: '💅' },
    { name: 'Material-UI', category: TechCategory.FRONTEND, color: 'text-blue-700', icon: '🎭' },
    { name: 'Styled Components', category: TechCategory.FRONTEND, color: 'text-pink-400', icon: '💄' },

    // Backend Technologies
    { name: 'Node.js', category: TechCategory.BACKEND, color: 'text-green-600', icon: '🟢' },
    { name: 'Express.js', category: TechCategory.BACKEND, color: 'text-gray-600', icon: '🚄' },
    { name: 'Laravel', category: TechCategory.BACKEND, color: 'text-red-500', icon: '🎯' },
    { name: 'Django', category: TechCategory.BACKEND, color: 'text-green-700', icon: '🐍' },
    { name: 'FastAPI', category: TechCategory.BACKEND, color: 'text-teal-500', icon: '⚡' },
    { name: 'Spring Boot', category: TechCategory.BACKEND, color: 'text-green-600', icon: '🍃' },
    { name: 'Python', category: TechCategory.BACKEND, color: 'text-yellow-600', icon: '🐍' },
    { name: 'PHP', category: TechCategory.BACKEND, color: 'text-indigo-600', icon: '🔵' },
    { name: 'GraphQL', category: TechCategory.BACKEND, color: 'text-pink-600', icon: '🔗' },
    { name: 'Apollo Server', category: TechCategory.BACKEND, color: 'text-purple-600', icon: '🚀' },

    // Database Technologies
    { name: 'MongoDB', category: TechCategory.DATABASE, color: 'text-green-500', icon: '🍃' },
    { name: 'PostgreSQL', category: TechCategory.DATABASE, color: 'text-blue-700', icon: '🐘' },
    { name: 'MySQL', category: TechCategory.DATABASE, color: 'text-blue-600', icon: '🐬' },
    { name: 'Redis', category: TechCategory.DATABASE, color: 'text-red-600', icon: '⚡' },
    { name: 'Firebase', category: TechCategory.DATABASE, color: 'text-orange-500', icon: '🔥' },
    { name: 'Cloud Firestore', category: TechCategory.DATABASE, color: 'text-orange-400', icon: '☁️' },
    { name: 'SQLite', category: TechCategory.DATABASE, color: 'text-gray-600', icon: '💾' },
    { name: 'InfluxDB', category: TechCategory.DATABASE, color: 'text-blue-500', icon: '📊' },

    // Mobile Technologies
    { name: 'React Native', category: TechCategory.MOBILE, color: 'text-blue-500', icon: '📱' },
    { name: 'Flutter', category: TechCategory.MOBILE, color: 'text-blue-400', icon: '🦋' },
    { name: 'Dart', category: TechCategory.MOBILE, color: 'text-blue-600', icon: '🎯' },
    { name: 'Expo', category: TechCategory.MOBILE, color: 'text-black', icon: '⚫' },
    { name: 'Redux', category: TechCategory.MOBILE, color: 'text-purple-600', icon: '🔄' },
    { name: 'Redux Toolkit', category: TechCategory.MOBILE, color: 'text-purple-500', icon: '🛠️' },
    { name: 'React Navigation', category: TechCategory.MOBILE, color: 'text-blue-400', icon: '🧭' },

    // Design Technologies
    { name: 'Figma', category: TechCategory.DESIGN, color: 'text-purple-500', icon: '🎨' },
    { name: 'Adobe Illustrator', category: TechCategory.DESIGN, color: 'text-orange-600', icon: '🎭' },
    { name: 'Adobe Photoshop', category: TechCategory.DESIGN, color: 'text-blue-600', icon: '🖼️' },
    { name: 'Sketch', category: TechCategory.DESIGN, color: 'text-yellow-500', icon: '✏️' },
    { name: 'Adobe Creative Suite', category: TechCategory.DESIGN, color: 'text-red-600', icon: '🎨' },
    { name: 'InDesign', category: TechCategory.DESIGN, color: 'text-pink-600', icon: '📄' },
    { name: 'Principle', category: TechCategory.DESIGN, color: 'text-blue-500', icon: '🎬' },
    { name: 'Zeplin', category: TechCategory.DESIGN, color: 'text-orange-500', icon: '🎯' },
    { name: 'Storybook', category: TechCategory.DESIGN, color: 'text-pink-500', icon: '📚' },

    // DevOps Technologies
    { name: 'Docker', category: TechCategory.DEVOPS, color: 'text-blue-500', icon: '🐳' },
    { name: 'Kubernetes', category: TechCategory.DEVOPS, color: 'text-blue-700', icon: '☸️' },
    { name: 'AWS', category: TechCategory.DEVOPS, color: 'text-orange-500', icon: '☁️' },
    { name: 'AWS S3', category: TechCategory.DEVOPS, color: 'text-orange-400', icon: '🪣' },
    { name: 'Vercel', category: TechCategory.DEVOPS, color: 'text-black', icon: '▲' },
    { name: 'Netlify', category: TechCategory.DEVOPS, color: 'text-teal-500', icon: '🌐' },
    { name: 'Heroku', category: TechCategory.DEVOPS, color: 'text-purple-600', icon: '💜' },
    { name: 'GitHub Pages', category: TechCategory.DEVOPS, color: 'text-gray-800', icon: '📄' },

    // Blockchain
    { name: 'Web3.js', category: TechCategory.BLOCKCHAIN, color: 'text-yellow-600', icon: '🌐' },
    { name: 'Ethereum', category: TechCategory.BLOCKCHAIN, color: 'text-gray-700', icon: '💎' },

    // AI/ML
    { name: 'TensorFlow', category: TechCategory.AI_ML, color: 'text-orange-600', icon: '🧠' },
    { name: 'D3.js', category: TechCategory.AI_ML, color: 'text-orange-500', icon: '📊' },
    { name: 'Chart.js', category: TechCategory.AI_ML, color: 'text-pink-500', icon: '📈' },

    // Game Development
    { name: 'Unity', category: TechCategory.GAME_DEV, color: 'text-black', icon: '🎮' },
    { name: 'C#', category: TechCategory.GAME_DEV, color: 'text-green-600', icon: '💚' },
    { name: 'Blender', category: TechCategory.GAME_DEV, color: 'text-orange-500', icon: '🎭' },
    { name: 'FMOD', category: TechCategory.GAME_DEV, color: 'text-blue-600', icon: '🔊' },
    { name: 'Unity Analytics', category: TechCategory.GAME_DEV, color: 'text-gray-700', icon: '📊' },
    { name: 'DOTween', category: TechCategory.GAME_DEV, color: 'text-purple-500', icon: '🎬' },

    // Other Technologies
    { name: 'JWT', category: TechCategory.OTHER, color: 'text-black', icon: '🔐' },
    { name: 'Swagger', category: TechCategory.OTHER, color: 'text-green-600', icon: '📋' },
    { name: 'OpenAPI', category: TechCategory.OTHER, color: 'text-green-500', icon: '📖' },
    { name: 'WebRTC', category: TechCategory.OTHER, color: 'text-blue-600', icon: '📹' },
    { name: 'Socket.io', category: TechCategory.OTHER, color: 'text-black', icon: '🔌' },
    { name: 'Stripe', category: TechCategory.OTHER, color: 'text-blue-600', icon: '💳' },
    { name: 'Google Maps API', category: TechCategory.OTHER, color: 'text-red-500', icon: '🗺️' },
    { name: 'Photon', category: TechCategory.OTHER, color: 'text-blue-400', icon: '⚡' },
    { name: 'MQTT', category: TechCategory.OTHER, color: 'text-purple-600', icon: '📡' },
    { name: 'Grafana', category: TechCategory.OTHER, color: 'text-orange-600', icon: '📊' },
    { name: 'Celery', category: TechCategory.OTHER, color: 'text-green-600', icon: '🥬' },
    { name: 'Prisma', category: TechCategory.OTHER, color: 'text-blue-700', icon: '🔷' },
    { name: 'Gulp', category: TechCategory.OTHER, color: 'text-red-600', icon: '🥤' },
    { name: 'HealthKit', category: TechCategory.OTHER, color: 'text-red-500', icon: '❤️' }
  ];

  constructor() { }

  getAllTechnologies(): TechnologyInfo[] {
    return this.technologies;
  }

  getTechnologiesByCategory(category: TechCategory): TechnologyInfo[] {
    return this.technologies.filter(tech => tech.category === category);
  }

  getTechnologyInfo(name: string): TechnologyInfo | undefined {
    return this.technologies.find(tech => 
      tech.name.toLowerCase() === name.toLowerCase()
    );
  }

  getTechnologyColor(name: string): string {
    const tech = this.getTechnologyInfo(name);
    return tech ? tech.color : 'text-gray-500';
  }

  getTechnologyIcon(name: string): string {
    const tech = this.getTechnologyInfo(name);
    return tech ? tech.icon || '🔧' : '🔧';
  }

  getPopularTechnologies(limit: number = 10): TechnologyInfo[] {
    // Simulate popularity by returning a curated list
    const popularTechs = [
      'React', 'Angular', 'Vue.js', 'Node.js', 'TypeScript', 
      'Python', 'MongoDB', 'PostgreSQL', 'Docker', 'Firebase'
    ];
    
    return popularTechs
      .map(name => this.getTechnologyInfo(name))
      .filter(tech => tech !== undefined)
      .slice(0, limit) as TechnologyInfo[];
  }

  searchTechnologies(query: string): TechnologyInfo[] {
    const lowercaseQuery = query.toLowerCase();
    return this.technologies.filter(tech =>
      tech.name.toLowerCase().includes(lowercaseQuery) ||
      tech.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  updateTechnologyCount(name: string, count: number): void {
    const tech = this.getTechnologyInfo(name);
    if (tech) {
      tech.count = count;
    }
  }
}