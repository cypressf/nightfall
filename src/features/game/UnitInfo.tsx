import Unit from "../unit/Unit";
import styles from './Game.module.css';

const UnitInfo = ({ unit }: { unit: Unit }) =>
    <div className={styles.unitInfo}>
        <h2 style={{ color: unit.stats.headColor }}>{unit.stats.name}</h2>
        <table>
            <tbody>
                <tr>
                    <th>Movement range</th>
                    <td>{unit.stats.movement}</td>
                </tr>
                <tr>
                    <th>Attack range</th>
                    <td>{unit.stats.range}</td>
                </tr>
                <tr>
                    <th>Max Length</th>
                    <td>{unit.stats.maxLength}</td>
                </tr>
                <tr>
                    <th>Attack strength</th>
                    <td>{unit.stats.attack}</td>
                </tr>
            </tbody>
        </table >
    </div>;


export default UnitInfo;