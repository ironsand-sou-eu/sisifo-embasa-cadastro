import React from "react";
import PartesColumn from "./PartesColumn";
import Text from "./Text";
import Select from "./Select";
import Checkbox from "./Checkbox";
import PedidosBox from "./PedidosBox";
import Button from "./Button";
import useValidator from "../hooks/useValidator";
import useUpdateCausaPedir from "../hooks/useUpdateCausaPedir";
import { debounce, toISOStringInSalvadorTimezone } from "../../utils/utils";
import hardcoded from "../../hardcodedValues";

export default function PopupForm({ onSubmit, data, updateData, setLoading }) {
  const { warningMessages, missingEssential } = useValidator(data);
  const { updateCausaPedir } = useUpdateCausaPedir(data, setLoading);

  return (
    <form
      className="form-horizontal"
      action=""
      method="post"
      id="confirmation_info"
      onSubmit={e => {
        onSubmit(e);
      }}
    >
      <div className="form-group">
        <Text
          type="text"
          name="numeroProcesso"
          label="Número"
          value={data?.numeroProcesso ?? ""}
          placeholder="Número do processo"
          isDisabled
          colWidth="4"
        />
        <Text
          type="text"
          name="matricula"
          label="Matrícula"
          value={data?.matricula ?? ""}
          placeholder="Matrícula"
          onChange={event => updateData(event.target.value, event.target.name)}
          colWidth="4"
        />
        <Text
          type="text"
          name="localidadeCode"
          label="Código da localidade SCI"
          value={data?.localidadeCode ?? ""}
          placeholder="Código Localidade SCI"
          onChange={event => updateData(event.target.value, event.target.name)}
          colWidth="4"
        />
      </div>
      <fieldset className="form-group">
        <legend className="sisifo-v-label">Partes</legend>
        <PartesColumn
          type="requerentes"
          partes={data?.partesRequerentes}
          label="Requerentes"
          onChange={updateData}
        />
        <PartesColumn
          type="requeridos"
          partes={data?.partesRequeridas}
          label="Requeridos"
          onChange={updateData}
        />
      </fieldset>
      <div className="form-group">
        <Select
          name="nomeAndamento"
          label="Nome andamento"
          sheetName={hardcoded.listaNomesAndamentoSheet}
          rangeName={hardcoded.listaNomesAndamentoRange}
          value={data?.nomeAndamento ?? ""}
          onChange={updateData}
        />
        <Text
          type="datetime-local"
          name="dataAndamento"
          label="Data do andamento"
          value={toISOStringInSalvadorTimezone(data?.dataAndamento, true) ?? ""}
          onChange={event => updateData(event.target.value, event.target.name)}
        />
      </div>
      <div className="form-group">
        <Select
          name="causaPedir"
          label="Causa de pedir"
          sheetName={hardcoded.listaCausasPedirSheet}
          rangeName={hardcoded.listaCausasPedirRange}
          value={data?.causaPedir ?? ""}
          onChange={newData =>
            debounce(updateCausaPedir(newData, updateData), 300)
          }
        />
        <Text
          type="date"
          name="dataCitacao"
          label="Citação"
          value={toISOStringInSalvadorTimezone(data?.dataCitacao ?? "")}
          placeholder="Data da citação"
          onChange={event => updateData(event.target.value, event.target.name)}
        />
      </div>
      <div className="form-group">
        <Checkbox
          label="Recomendar análise"
          name="recomendarAnalise"
          checked={data?.recomendarAnalise}
          onChange={event =>
            updateData(event.target.checked, event.target.name)
          }
        />
        <Text
          type="text"
          name="obsParaAdvogado"
          label="Observações"
          value={data?.obsParaAdvogado ?? ""}
          placeholder="Observações"
          onChange={event => updateData(event.target.value, event.target.name)}
        />
      </div>
      <div className="form-group">
        <Select
          name="advogado"
          label="Advogado responsável"
          sheetName={hardcoded.listaAdvogadosSheet}
          rangeName={hardcoded.listaAdvogadosRange}
          value={data?.advogado ?? ""}
          onChange={updateData}
        />
      </div>
      <div className="form-group">
        <Select
          name="rito"
          label="Rito"
          sheetName={hardcoded.listaRitosSheet}
          rangeName={hardcoded.listaRitosRange}
          value={data?.rito ?? ""}
          onChange={updateData}
        />
        <Select
          name="tipoAcao"
          label="Tipo de ação"
          sheetName={hardcoded.listaTiposAcaoSheet}
          rangeName={hardcoded.listaTiposAcaoRange}
          value={data?.tipoAcao ?? ""}
          onChange={updateData}
        />
      </div>
      <fieldset className="form-group">
        <legend className="sisifo-v-label">Pedidos e provisionamento</legend>
        <PedidosBox pedidos={data?.pedidos} onChange={updateData} />
      </fieldset>
      <div className="form-group">
        <Button
          label="Cadastrar"
          warningMessages={warningMessages}
          missingEssential={missingEssential}
        />
      </div>
    </form>
  );
}
