import styles from './styles.module.scss';

export default function CardGrid({ children }) {
  return <div className={styles.cardGrid}>{children}</div>;
}
