import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'pdm_rodrigo',
  slug: 'pdm_rodrigo',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'pdmrodrigo',
  userInterfaceStyle: 'automatic',
  ios: {
    icon: './assets/expo.icon',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    package: 'com.rodrigo.pdm_rodrigo',
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#208AEF',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'O app usa acesso às suas fotos para você escolher uma imagem de perfil.',
        cameraPermission: 'O app usa a câmera para você tirar uma foto de perfil.',
      },
    ],
    'expo-secure-store',
    'expo-image',
    ['expo-notifications', { defaultChannel: 'padrao', color: '#208AEF' }],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: 'cfc16338-59fb-4e65-bf34-2e1e02c2d40a',
    },
  },
};

export default config;
