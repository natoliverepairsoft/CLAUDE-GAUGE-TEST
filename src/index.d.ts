import { DefineComponent } from 'vue';

export interface GaugeProps {
    modelValue?: number;
    min?: number;
    max?: number;
    title?: string;
    unit?: string;
    color?: string;
    logo?: string;
    interactive?: boolean;
}

declare const Gauge: DefineComponent<GaugeProps>;

export { Gauge };
export default Gauge;
