import Exception from "./Exception";

export default class ProcessoAlreadyExistsException extends Exception {
  constructor(numeroProcesso, msgSetter) {
    const errorMessage = `O processo ${numeroProcesso} já está cadastrado.`;
    super(errorMessage, msgSetter);
  }
}
