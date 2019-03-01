import { Vec } from "@thi.ng/vectors";

export const enum IntersectionType {
    NONE,
    PARALLEL,
    COINCIDENT,
    COINCIDENT_NO_INTERSECT,
    INTERSECT,
    INTERSECT_OUTSIDE
}

export interface IntersectionResult {
    type: IntersectionType;
    isec?: Vec | Vec[];
    det?: number;
    alpha?: number;
    beta?: number;
    inside?: boolean;
}
