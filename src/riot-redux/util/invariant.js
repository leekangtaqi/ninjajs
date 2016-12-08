export default function invariant(o, msg) {
    if(typeof o === 'undefined' || !o){
        throw new Error(msg);
    }
}