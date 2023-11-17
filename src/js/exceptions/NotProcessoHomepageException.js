import Exception from "./Exception";

export default class NotProcessoHomepageException extends Exception {
  constructor(url) {
    const errorMessage = `A página ${url} não é uma página inicial de processo.`;
    super(errorMessage);
  }
}
