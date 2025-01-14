#!/usr/bin/env bun
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Task } from "./task";
import { TodoService } from "./todo-service";

const todoService = TodoService.create();

yargs(hideBin(process.argv))
	.scriptName("todo")
	.demandCommand()
	.command({
		command: "add",
		describe: "Adicionar uma tarefa",
		handler(argv) {
			todoService.addTask(Task.create(argv._.slice(1).join(" ") as string));
		},
	})
	.command({
		command: "ls",
		describe: "Listar todas as tarefas",
		handler() {
			todoService.list();
		},
	})
	.command({
		command: "rm",
		describe: "Remover tarefas",
		handler() {
			todoService.removeTask();
		},
	})
	.version("v1.0.0")
	.help()
	.alias("-h", "help")
	.wrap(null)
	.showHelpOnFail(true, " ")
	.parse();
