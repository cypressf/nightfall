import Unit from "../unit/Unit";
import styles from './Game.module.css';

const UnitInfo = ({ unit }: { unit: Unit }) =>
    <div className={styles.unitInfo}>
        <h2>{unit.stats.name}</h2>
        <h4>Movement</h4> {unit.stats.movement}
        <h4>Range</h4> {unit.stats.range}
        <h4>Max Length</h4> {unit.stats.maxLength}
        <h4>Attack</h4> {unit.stats.attack}
    </div>;

export default UnitInfo;