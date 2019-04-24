import { map, Transducer } from "@thi.ng/transducers";
import {
    BodyFormat,
    DateFormat,
    LogEntry,
    LogEntryObj
} from "../api";

const LEVELS = ["FINE", "DEBUG", "INFO", "WARN", "SEVERE"];

export const isoDate = (dt: number) => new Date(dt).toISOString();

export const formatString = (
    dtFmt?: DateFormat,
    bodyFmt?: BodyFormat
): Transducer<LogEntry, string> => {
    dtFmt = dtFmt || isoDate;
    bodyFmt = bodyFmt || ((x) => x.toString());
    return map(
        ([level, id, time, ...body]) =>
            `[${LEVELS[level]}] [${id}] ${dtFmt(time)} ${bodyFmt(body)}`
    );
};

export const formatObject = (): Transducer<LogEntry, LogEntryObj> =>
    map(([level, id, time, ...body]) => ({ level, id, time, body }));

export const formatJSON = (
    dtfmt?: DateFormat
): Transducer<LogEntry, string> => {
    dtfmt = dtfmt || isoDate;
    return map(([level, id, time, ...body]) =>
        JSON.stringify({
            id,
            level: LEVELS[level],
            time: dtfmt(time),
            body
        })
    );
};
