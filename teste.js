trilhas = {
    "Erro no Soldo":
        (valor("82001") != valor(("Dados", "Remuneracao", "82001"))) &
        (valor("82221") != valor(("Dados", "Remuneracao", "82001"))),

    "Moradia fora da tabela":
        ((valor("82001") > 0) &
            (valor(("82135", 1, 0)) !=
                valor(("Dados", "Remuneracao", "821350"))) &
            (valor(("82135", 1, 0)) !=
                valor(("Dados", "Remuneracao", "821351"))) &
            ((texto(("DADOS", "SIAPE", "SITUAÇÃO FUNCIONAL")) == "RMI-01") |
                (texto(("DADOS", "SIAPE", "SITUAÇÃO FUNCIONAL")) ==
                    "RMI-08"))) |
        ((valor(("82228", 1, 0)) != valor(("Dados", "Remuneracao", "821350"))) &
            (valor(("82228", 1, 0)) !=
                valor(("Dados", "Remuneracao", "821351"))) &
            (((valor("82221") > 0) &
                (texto(("DADOS", "SIAPE", "SITUAÇÃO FUNCIONAL")) == "RMI-33")) |
                (texto(("DADOS", "SIAPE", "SITUAÇÃO FUNCIONAL")) == "RMI-34"))),
    "Natalidade diferente do Soldo":
        (valor("82265") != 0) &
        (valor("82265") != valor(("Dados", "Remuneracao", "82001"))),

    "Natalidade sem prazo":
        (valor("82265") != 0) & (valor(("82265", TUDO, 0)) != 0),

    "Fardamento pago em mês diferente":
        (int(WORK_MONTH[-2]) <= 10) &
        (valor("82010") != 0) &
        (texto(("DADOS", "SIAPE", "VÍNCULO SERVIDOR")).str[-1].astype("int8") !=
            int(WORK_MONTH[-1])),
};

print(trilhas);
