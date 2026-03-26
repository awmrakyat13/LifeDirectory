import { SolarSystemView } from '../components/solar-system/SolarSystemView';
import styles from './HomePage.module.css';

export function HomePage() {
  return (
    <div className={styles.container}>
      <SolarSystemView />
    </div>
  );
}
