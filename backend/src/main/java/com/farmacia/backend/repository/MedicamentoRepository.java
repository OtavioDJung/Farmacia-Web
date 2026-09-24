package com.farmacia.backend.repository;

import com.farmacia.backend.model.Medicamento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicamentoRepository extends JpaRepository<Medicamento, Long> {

}