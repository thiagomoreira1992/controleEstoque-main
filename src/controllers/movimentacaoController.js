const Movimentacao = require('../models/movimentacao');
const Material = require('../models/material');
const sequelize = require('../db');
const moment = require('moment');
//const { BelongsTo, HasMany } = require('sequelize/types');

class MovimentacaoController {

    async criar(req, res) {
        const buscaMaterial = await Material.findOne({ where: { lote: `${req.body.lote}` } });
        console.log(buscaMaterial);
        if (buscaMaterial === null) {
            return res.json({ status: 404, body: 'Material não encontrado!' });
        } else {
            const movimentacao = await Movimentacao.create({
                idMaterial: buscaMaterial.id,
                quantidade: req.body.quantidade,
                lote: req.body.lote,
                profissional: req.body.profissional
            })

            let operacao = parseInt(buscaMaterial.quantidade) + parseInt(req.body.quantidade);

            const material = await Material.update({ quantidade: operacao }, {
                where: {
                    id: buscaMaterial.id
                }
            })
            return res.json({ status: 200, body: `Movimentação feita em ${buscaMaterial.nome}` });
            //return res.json(movimentacao);
        }
    }

    async listarTodos(req, res) {/*
        const movimentacao = await Movimentacao.findAll();
        let movimentacaoFiltrada;
        movimentacao.forEach(async element => {
            //console.log(element);
            let material = await Material.findOne({ where: { id: `${element.idMaterial}` } });
            try {
                if (await Material.findOne({ where: { id: `${element.idMaterial}` } }) === null) {
                    Object.assign(movimentacaoFiltrada, element);
                }
                /*if (JSON.stringify(material) === null) {
                    //
                    console.log(JSON.stringify(material));
                } else {
                }*//*
            } catch (err) {
                console.log(err);
            }
        });
        return res.json(movimentacaoFiltrada);*/

        /*const movimentacao = await Movimentacao.findAll({
            include: [{
                model: Material, 
                as: 'material',
                attributes: ['id'],
                required: true
            }]
        })
        return res.json(movimentacao);*/
        const movimentacao = await sequelize.query("SELECT movimentacaos.id, movimentacaos.\"idMaterial\", movimentacaos.quantidade, movimentacaos.lote, movimentacaos.profissional, movimentacaos.\"createdAt\", movimentacaos.\"updatedAt\" FROM movimentacaos inner JOIN materials ON materials.id = movimentacaos.\"idMaterial\";",{
            model: Movimentacao,
            mapToModel: true
        });
        console.log(movimentacao)
        return res.json(movimentacao);
    }

    async listarMateriaisGastos(req, res){
        const monthFirstDay = moment().startOf('month').format("YYYY-MM-DD");
        const monthLastDay = moment().endOf('month').format("YYYY-MM-DD");
        const movimentacao = await sequelize.query(`select materials.nome, sum(movimentacaos.quantidade) as quantidade from movimentacaos inner join materials on materials.id = movimentacaos.\"idMaterial\" where movimentacaos.quantidade < 0 and movimentacaos.\"createdAt\" between '${monthFirstDay}' and '${monthLastDay}' group by materials.nome order by materials.nome;`, {
            model: Movimentacao,
            mapToModel: true
        });
        console.log(monthFirstDay);
        return res.json(movimentacao);
    }

}

module.exports = new MovimentacaoController;