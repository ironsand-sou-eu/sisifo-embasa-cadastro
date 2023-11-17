import React from "react";
import Parte from "./Parte";
import hardcoded from "../../hardcodedValues";
import { nomesEmbasa } from "../../enums";

export default function PartesColumn({ partes, label, type, onChange }) {
  if (!partes) return;

  function flagParteAsClient(personName, isClient) {
    partes.forEach(element => {
      if (element.nomePessoa === personName) element.flagCliente = isClient;
    });
    return partes;
  }

  let i = 0;
  return (
    <div className="col-sm-6">
      <label className="col-sm-12 sisifo-v-label">{label}</label>
      <div className="col-sm-12 inputGroupContainer">
        {partes.map(parte => (
          <Parte
            key={i++}
            type={type}
            isClient={nomesEmbasa.some(nomeEmbasa =>
              String(parte.nome)
                .toLowerCase()
                .includes(nomeEmbasa.toLowerCase())
            )}
            value={parte.nome}
            onChange={event => {
              const newFlaggedPartes = flagParteAsClient(
                parte.nome,
                event.target.checked
              );
              onChange(newFlaggedPartes, { name: type });
            }}
          />
        ))}
      </div>
    </div>
  );
}
