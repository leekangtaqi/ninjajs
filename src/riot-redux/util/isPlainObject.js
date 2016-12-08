export default function isPlainObject(o) {
    return typeof o === 'object' && !Array.isArray(o)
}