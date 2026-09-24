package com.farmacia.backend.service;

import com.farmacia.backend.model.Medicamento;
import com.farmacia.backend.repository.MedicamentoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicamentoService {

    private final MedicamentoRepository repository;

    public MedicamentoService(MedicamentoRepository repository) {
        this.repository = repository;
    }

    public List<Medicamento> listarTodos() {
        return repository.findAll();
    }

    public Medicamento cadastrar(Medicamento medicamento) {
        return repository.save(medicamento);
    }

    public void remover(Long id) {
        repository.deleteById(id);
    }
}