package com.everyWear.everyWear.DAO;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.everyWear.everyWear.model.Stock;

import jakarta.persistence.LockModeType;

public interface StockDAO extends JpaRepository<Stock, Integer> {

    @Query("""
            select s
            from Stock s
            left join fetch s.item i
            order by i.id asc, s.size asc
            """)
    List<Stock> findAllWithItem();

    @Query("""
            select s
            from Stock s
            left join fetch s.item i
            where i.id = :itemId
            """)
    List<Stock> findByItemId(@Param("itemId") Integer itemId);

    @Query("""
            select s
            from Stock s
            where s.item.id = :itemId
            and s.size = :size
            """)
	    Optional<Stock> findByItemIdAndSize(
	            @Param("itemId") Integer itemId,
	            @Param("size") String size);

	    @Lock(LockModeType.PESSIMISTIC_WRITE)
	    @Query("""
	            select s
	            from Stock s
	            where s.item.id = :itemId
	            and s.size = :size
	            """)
	    Optional<Stock> findForUpdateByItemIdAndSize(
	            @Param("itemId") Integer itemId,
	            @Param("size") String size);
}
