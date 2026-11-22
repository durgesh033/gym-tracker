import { Slot } from 'expo-router';
import { Providers } from '@lib/providers';

export default function App() {
  return (
    <Providers>
      <Slot />
    </Providers>
  );
}