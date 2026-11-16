package pe.edu.centrovarones.api.controller;

import pe.edu.centrovarones.api.service.AcademicService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auditoria")
public class AuditoriaController {
  private final AcademicService service;
  public AuditoriaController(AcademicService service) { this.service=service; }

  @GetMapping
  public List<Map<String,Object>> list() { return service.auditoria(); }

  @PostMapping("/{id}/revertir")
  public Map<String,Object> revertir(@PathVariable long id) {
    try {
      Map<String,Object> row=service.revertirAuditoria(id);
      if(row==null) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Auditoría no encontrada.");
      return row;
    } catch(IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,e.getMessage());
    }
  }
}
