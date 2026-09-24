package com.farmacia.backend.controller;

import com.farmacia.backend.model.Medicamento;
import com.farmacia.backend.service.MedicamentoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medicamentos")
@CrossOrigin(origins = "*")
public class MedicamentoController {

    private final MedicamentoService service;

    public MedicamentoController(MedicamentoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Medicamento> listarTodos() {
        return service.listarTodos();
    }

    @PostMapping
    public Medicamento cadastrar(@RequestBody Medicamento medicamento) {
        return service.cadastrar(medicamento);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        service.remover(id);
        return ResponseEntity.noContent().build();
    }
}