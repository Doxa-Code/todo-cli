#!/usr/bin/env bun
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import pkg from "../package.json";
import { TodoService } from "./todo-service";

const todoService = TodoService.create();

yargs(hideBin(process.argv))
	.scriptName("todo")
	.demandCommand()
	.command({
		command: "add",
		describe: "Adicionar uma tarefa",
		handler() {
			todoService.addTask();
		},
	})
	.command({
		command: "ls",
		describe: "Listar todas as tarefas",
		handler() {
			todoService.list();
		},
	})
	.version(pkg.version)
	.help()
	.alias("-h", "help")
	.wrap(null)
	.showHelpOnFail(true, " ")
	.parse();
