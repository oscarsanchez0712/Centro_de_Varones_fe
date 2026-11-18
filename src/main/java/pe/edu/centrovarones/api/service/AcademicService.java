package pe.edu.centrovarones.api.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class AcademicService {
  private final JdbcTemplate db;
  private final ObjectMapper json;
  public AcademicService(JdbcTemplate db, ObjectMapper json) { this.db=db; this.json=json; }
  private static final TypeReference<Map<String,Object>> MAP = new TypeReference<>() {};
  private Map<String,Object> read(String s) { try { return json.readValue(s, MAP); } catch(Exception e) { throw new IllegalStateException("No se pudo leer matrícula guardada",e); } }
  private String write(Object o) { try { return json.writeValueAsString(o); } catch(Exception e) { throw new IllegalArgumentException("Datos de matrícula no válidos",e); } }
  private void audit(String entity,String id,String action,Object before,Object after) {
    if("REVERTIR_AUDITORIA".equals(action)) {
      db.update("INSERT INTO dbo.Auditoria(Entidad,EntidadId,Accion,DatosAnteriores,DatosNuevos,Revertida) VALUES(?,?,?,?,?,1)",entity,id,action,write(before),write(after));
    } else {
      db.update("INSERT INTO dbo.Auditoria(Entidad,EntidadId,Accion,DatosAnteriores,DatosNuevos) VALUES(?,?,?,?,?)",entity,id,action,write(before),write(after));
    }
  }
  private Object get(Map<String,Object> map,String key) { return map.entrySet().stream().filter(e->e.getKey().equalsIgnoreCase(key)).map(Map.Entry::getValue).findFirst().orElse(null); }
  private Map<String,Object> object(Object v) { return v instanceof Map<?,?> m ? (Map<String,Object>)m : Map.of(); }
  private String text(Object o) { return o==null?"":String.valueOf(o).trim(); }
  private String level(String grade) { if(grade.toLowerCase().contains("primaria")) return "Primaria"; if(grade.toLowerCase().contains("secundaria")) return "Secundaria"; return ""; }
  private String suggestedGrade(int age) {
    return switch(age) {
      case 6 -> "1er Grado Primaria"; case 7 -> "2do Grado Primaria"; case 8 -> "3er Grado Primaria"; case 9 -> "4to Grado Primaria"; case 10 -> "5to Grado Primaria"; case 11 -> "6to Grado Primaria";
      case 12 -> "1er Grado Secundaria"; case 13 -> "2do Grado Secundaria"; case 14 -> "3er Grado Secundaria"; case 15 -> "4to Grado Secundaria"; case 16 -> "5to Grado Secundaria"; default -> "";
    };
  }
  private Map<String,Object> matriculaBy(String field,String value) {
    List<String> rows=db.query("SELECT TOP (1) DatosJson FROM dbo.Matriculas WHERE "+field+"=? ORDER BY MatriculaId DESC",(rs,n)->rs.getString(1),value);
    return rows.isEmpty()?null:withRegistrationDate(read(rows.get(0)));
  }
  private Map<String,Object> withRegistrationDate(Map<String,Object> row) { if(row!=null && get(row,"fecha")==null && get(row,"fechaRegistro")!=null) row.put("fecha",get(row,"fechaRegistro")); return row; }
  public List<Map<String,Object>> matriculas() { return db.query("SELECT DatosJson FROM dbo.Matriculas ORDER BY MatriculaId DESC",(rs,n)->withRegistrationDate(read(rs.getString(1)))); }
  public Map<String,Object> bySolicitud(String n) { return matriculaBy("NumeroSolicitud",n); }
  public Map<String,Object> byDni(String dni) { return matriculaBy("DNI",dni); }
  @Transactional
  public Map<String,Object> updateMatricula(String numero,Map<String,Object> changes) {
    Map<String,Object> before=bySolicitud(numero); if(before==null)return null;
    Map<String,Object> after=new LinkedHashMap<>(before);
    for(String key:List.of("estudiante","apoderado","documentos")) {
      Object value=get(changes,key);
      if(value instanceof Map<?,?> incoming) {
        Map<String,Object> merged=new LinkedHashMap<>(object(get(before,key)));
        for(var entry:incoming.entrySet()) if(entry.getKey() instanceof String k) merged.put(k,entry.getValue());
        after.put(key,merged);
      } else if(changes.keySet().stream().anyMatch(k->k.equalsIgnoreCase(key)) && !key.equals("documentos")) {
        throw new IllegalArgumentException("El campo "+key+" debe ser un objeto.");
      } else if(value!=null) after.put(key,value);
    }
    Map<String,Object> student=object(get(after,"estudiante")), guardian=object(get(after,"apoderado"));
    String dni=text(get(student,"dni")), grade=text(get(student,"grado")), dob=text(get(student,"fechaNacimiento"));
    if(!dni.matches("\\d{8}")) throw new IllegalArgumentException("El DNI del estudiante debe tener 8 dígitos.");
    if(text(get(guardian,"dni")).equals(dni)) throw new IllegalArgumentException("El DNI del apoderado debe ser distinto al del estudiante.");
    if(level(grade).isBlank()) throw new IllegalArgumentException("El grado debe ser de Primaria o Secundaria.");
    LocalDate birth;
    try { birth=LocalDate.parse(dob,DateTimeFormatter.ISO_LOCAL_DATE); } catch(Exception ex) { try { birth=LocalDate.parse(dob,DateTimeFormatter.ofPattern("MM/dd/yyyy")); } catch(Exception e) { throw new IllegalArgumentException("La fecha de nacimiento no es válida."); } }
    LocalDate cutoff=LocalDate.of(2026,3,31);
    if(birth.isAfter(cutoff) || !suggestedGrade(Period.between(birth,cutoff).getYears()).equalsIgnoreCase(grade)) throw new IllegalArgumentException("El grado no corresponde a la fecha de nacimiento al 31 de marzo de 2026.");
    after.put("estudiante",student);
    db.update("UPDATE dbo.Matriculas SET DNI=?,Grado=?,DatosJson=? WHERE NumeroSolicitud=?",dni,grade,write(after),numero);
    audit("MATRICULA",numero,"ACTUALIZAR",before,after);
    return after;
  }
  @Transactional
  public Map<String,Object> createMatricula(Map<String,Object> request) {
    Map<String,Object> student=object(get(request,"estudiante")), guardian=object(get(request,"apoderado"));
    String dni=text(get(student,"dni")), grade=text(get(student,"grado")), dob=text(get(student,"fechaNacimiento"));
    if(!dni.matches("\\d{8}")) throw new IllegalArgumentException("El DNI del estudiante debe tener 8 dígitos.");
    if(text(get(guardian,"dni")).equals(dni)) throw new IllegalArgumentException("El DNI del apoderado debe ser distinto al del estudiante.");
    if(level(grade).isBlank()) throw new IllegalArgumentException("El grado debe ser de Primaria o Secundaria.");
    LocalDate birth;
    try { birth=LocalDate.parse(dob,DateTimeFormatter.ISO_LOCAL_DATE); } catch(Exception ex) { try { birth=LocalDate.parse(dob,DateTimeFormatter.ofPattern("MM/dd/yyyy")); } catch(Exception e) { throw new IllegalArgumentException("La fecha de nacimiento no es válida."); } }
    LocalDate cutoff=LocalDate.of(2026,3,31); if(birth.isAfter(cutoff)) throw new IllegalArgumentException("La fecha de nacimiento es posterior al corte escolar.");
    if(!suggestedGrade(Period.between(birth,cutoff).getYears()).equalsIgnoreCase(grade)) throw new IllegalArgumentException("El grado no corresponde a la fecha de nacimiento al 31 de marzo de 2026.");
    if(db.queryForObject("SELECT COUNT(*) FROM dbo.Matriculas WHERE AnioEscolar=2026 AND DNI=?",Integer.class,dni)>0) throw new DuplicateKeyException("Ya existe matrícula para ese DNI en 2026.");
    String temporaryNumber="TMP-"+UUID.randomUUID().toString().replace("-","").substring(0,24);
    Long id=db.queryForObject("INSERT INTO dbo.Matriculas(NumeroSolicitud,AnioEscolar,DNI,Grado,Estado,DatosJson) OUTPUT INSERTED.MatriculaId VALUES(?,2026,?,?,N'EN REVISIÓN',N'{}')",Long.class,temporaryNumber,dni,grade);
    String number=String.format("MAT-2026-%06d",id);
    Map<String,Object> result=new LinkedHashMap<>(); result.put("numeroSolicitud",number); String registrationDate=LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")); result.put("fecha",registrationDate); result.put("fechaRegistro",registrationDate); result.put("estudiante",student); result.put("apoderado",guardian); result.put("documentos",get(request,"documentos")); result.put("estado","EN REVISIÓN");
    db.update("UPDATE dbo.Matriculas SET NumeroSolicitud=?,DatosJson=? WHERE MatriculaId=?",number,write(result),id); return result;
  }
  @Transactional
  public Map<String,Object> updateEstado(String numero,String estado) {
    if(!List.of("APROBADA","EN REVISIÓN").contains(estado)) throw new IllegalArgumentException("Estado inválido.");
    Map<String,Object> row=bySolicitud(numero); if(row==null)return null; row.put("estado",estado);
    Map<String,Object> before=bySolicitud(numero);
    db.update("UPDATE dbo.Matriculas SET Estado=?,DatosJson=? WHERE NumeroSolicitud=?",estado,write(row),numero);
    audit("MATRICULA",numero,"CAMBIAR_ESTADO",before,row); return row;
  }
  public List<Map<String,Object>> auditoria() {
    return db.query("SELECT AuditoriaId,Entidad,EntidadId,Accion,DatosAnteriores,DatosNuevos,Fecha,Revertida FROM dbo.Auditoria ORDER BY AuditoriaId DESC",(rs,n)-> {
      Map<String,Object> row=new LinkedHashMap<>(); row.put("id",rs.getLong("AuditoriaId")); row.put("entidad",rs.getString("Entidad")); row.put("entidadId",rs.getString("EntidadId")); row.put("accion",rs.getString("Accion")); row.put("datosAnteriores",read(rs.getString("DatosAnteriores"))); row.put("datosNuevos",read(rs.getString("DatosNuevos"))); row.put("fecha",rs.getTimestamp("Fecha").toInstant().toString()); row.put("revertida",rs.getBoolean("Revertida")); return row;
    });
  }
  @Transactional
  public Map<String,Object> revertirAuditoria(long id) {
    List<Map<String,Object>> rows=db.query("SELECT AuditoriaId,Entidad,EntidadId,DatosAnteriores,Revertida FROM dbo.Auditoria WHERE AuditoriaId=?",(rs,n)-> {
      Map<String,Object> row=new HashMap<>(); row.put("id",rs.getLong("AuditoriaId")); row.put("entidad",rs.getString("Entidad")); row.put("entidadId",rs.getString("EntidadId")); row.put("anterior",read(rs.getString("DatosAnteriores"))); row.put("revertida",rs.getBoolean("Revertida")); return row;
    },id);
    if(rows.isEmpty())return null;
    Map<String,Object> audit=rows.get(0); String entityId=(String)audit.get("entidadId");
    if((Boolean)audit.get("revertida")) throw new IllegalArgumentException("Esta auditoría ya fue revertida.");
    Integer later=db.queryForObject("SELECT COUNT(*) FROM dbo.Auditoria WHERE Entidad=? AND EntidadId=? AND AuditoriaId>? AND Revertida=0",Integer.class,audit.get("entidad"),entityId,id);
    if(later!=null && later>0) throw new IllegalArgumentException("Revierte primero la auditoría más reciente de este registro.");
    if(!"MATRICULA".equals(audit.get("entidad"))) throw new IllegalArgumentException("Tipo de auditoría no compatible.");
    Map<String,Object> previous=object(audit.get("anterior"));
    Map<String,Object> student=object(get(previous,"estudiante"));
    db.update("UPDATE dbo.Matriculas SET DNI=?,Grado=?,Estado=?,DatosJson=? WHERE NumeroSolicitud=?",text(get(student,"dni")),text(get(student,"grado")),text(get(previous,"estado")),write(previous),entityId);
    db.update("UPDATE dbo.Auditoria SET Revertida=1 WHERE AuditoriaId=?",id);
    audit("MATRICULA",entityId,"REVERTIR_AUDITORIA",bySolicitud(entityId),previous);
    return previous;
  }
  public List<String> cursos(String nivel) {
    if(!List.of("primaria","secundaria").contains(nivel.toLowerCase())) throw new IllegalArgumentException("El nivel debe ser Primaria o Secundaria.");
    return db.query("SELECT Nombre FROM dbo.Cursos WHERE Nivel=? AND Activo=1 ORDER BY CursoId",(rs,n)->rs.getString(1),nivel.substring(0,1).toUpperCase()+nivel.substring(1).toLowerCase());
  }
  public List<Map<String,Object>> notas() { return db.query("SELECT n.NotaId AS id,RTRIM(m.DNI) AS dni,c.Nombre AS curso,n.Calificacion AS nota FROM dbo.Notas n JOIN dbo.Matriculas m ON m.MatriculaId=n.MatriculaId JOIN dbo.Cursos c ON c.CursoId=n.CursoId ORDER BY n.NotaId ASC",(rs,n)->Map.of("id",rs.getLong("id"),"dni",rs.getString("dni"),"curso",rs.getString("curso"),"nota",rs.getBigDecimal("nota"))); }
  @Transactional
  public Map<String,Object> createNota(Map<String,Object> req) {
    String dni=text(req.get("dni")), course=text(req.get("curso")); java.math.BigDecimal score;
    try { score=new java.math.BigDecimal(String.valueOf(req.get("nota")).trim()); } catch(Exception e) { throw new IllegalArgumentException("La nota debe ser numérica."); }
    if(score.compareTo(java.math.BigDecimal.ZERO)<0||score.compareTo(java.math.BigDecimal.valueOf(20))>0) throw new IllegalArgumentException("La nota debe estar entre 0 y 20.");
    if(score.stripTrailingZeros().scale()>1) throw new IllegalArgumentException("La nota admite como máximo un decimal.");
    score=score.setScale(1,java.math.RoundingMode.UNNECESSARY);
    Map<String,Object> mat=byDni(dni); if(mat==null)throw new NoSuchElementException("No existe matrícula para ese DNI.");
    String grade=text(get(object(get(mat,"estudiante")),"grado")),lvl=level(grade); if(lvl.isBlank())throw new IllegalArgumentException("No se reconoce el nivel del grado.");
    List<Integer> cid=db.query("SELECT CursoId FROM dbo.Cursos WHERE Nombre=? AND Nivel=? AND Activo=1",(rs,n)->rs.getInt(1),course,lvl); if(cid.isEmpty())throw new IllegalArgumentException("El curso no corresponde al nivel del estudiante.");
    List<Long> matriculaIds=db.query("SELECT TOP (1) MatriculaId FROM dbo.Matriculas WHERE DNI=? ORDER BY MatriculaId DESC",(rs,n)->rs.getLong(1),dni);
    if(matriculaIds.isEmpty()) throw new NoSuchElementException("No existe matrícula en SQL Server para ese DNI.");
    try { Long id=db.queryForObject("INSERT INTO dbo.Notas(MatriculaId,CursoId,Calificacion) OUTPUT INSERTED.NotaId VALUES(?,?,?)",Long.class,matriculaIds.get(0),cid.get(0),score); return Map.of("id",id,"dni",dni,"curso",course,"nota",score); }
    catch(DuplicateKeyException e) { throw new DuplicateKeyException("Ya existe una nota para ese estudiante y curso."); }
  }
  public boolean deleteNota(long id) { return db.update("DELETE FROM dbo.Notas WHERE NotaId=?",id)>0; }
}